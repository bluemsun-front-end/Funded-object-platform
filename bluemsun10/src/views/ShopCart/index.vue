<template> 

  <div>
    <NavBar />
    <div class="cart-card">
      <div class="cart-container">
       
          <!-- 移除原来的全选按钮 -->
          <div class="header-container">
            <div class="selected-count" v-if="selectedItems.length > 0">
              已选择 {{ selectedItems.length }} 个商品
            </div>
          </div>
          
          <div class="card-container">
            <!-- 商品卡片 -->
            <div v-for="item in filteredItems" 
                 :key="item.goodsId" 
                 :class="['item-card', {'item-selected': selectedItems.includes(item.goodsId)}]">
              <el-checkbox
                v-model="selectedItems"
            
                :value="item.goodsId"
                @change="updateSelectedTotalPrice" /> 

                <div class="item-image-container">
                  <img :src="item.imageUrlUrl" alt="商品图片" class="item-image" /> 
                </div>
            
              <div class="item-info">
                <div class="item-details">
                  <el-tooltip :content=item.goodsName placement="top">
                    <h3 class="item-name">{{ item.goodsName }}</h3>
                  </el-tooltip>
                  <p class="item-price">{{ formatPrice(item).replace('¥', '') }}</p>
                  <p class="currency-type">货币类型: {{ item.currencyType === '0' ? '日用币' : '服装币' }}</p>
                </div>
                
                <div class="item-actions">
                  <el-input-number
                    v-model="item.num"
                    :min="1"
                    :max="item.limitNum"
                    @change="(value) => throttledQuantityChange(item, value)"
                    class="quantity-input"
                  />
                  <el-button type="danger" @click="showRemoveConfirmation(item.goodsId)" class="remove">移除</el-button>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 购物车为空的展示 -->
          <div v-if="filteredItems.length === 0" class="empty-cart">
            <img src="../background/emptyCart.png" alt="空购物车" class="empty-cart-image">
            <p class="empty-cart-text">您的购物车是空的</p>
            <el-button type="primary" class="empty-cart-button" @click="toHome">继续购物</el-button>
          </div>

          <!-- 底部结算区域重新设计 -->
          <div class="foot">
            <!-- 添加全选按钮到底部 -->
            <div class="foot-left">
              <el-checkbox 
                class="choose" 
                v-model="isAllSelected" 
                @change="toggleSelectAll">全选</el-checkbox>
            </div>
            
            <div class="foot-middle">
              <div class="currency-info">
                <span>日用币: {{ dailyTotal.toFixed(2) }}</span>
                <span>服装币: {{ clothingTotal.toFixed(2) }}</span>
              </div>
            </div>

            <div class="foot-right">
              <el-button 
                :type="selectedItems.length > 0 ? 'success' : 'info'" 
                @click="checkout" 
                class="checkout-button"
                :disabled="selectedItems.length === 0"
              >
                结算 {{ selectedItems.length > 0 ? `(${selectedItems.length})` : '' }}
              </el-button> 
            </div>

            <!-- 确认结算对话框 --> 
            <el-dialog
              v-model="checkoutInfo"
              title="确认结算"
              width="500px"
              class="checkout-dialog"
            >
              <div class="checkout-details">
                <div class="checkout-item">
                  <span>服装币总额:</span>
                  <span class="price">{{ clothingTotal.toFixed(2) }}</span>
                </div>
                <div class="checkout-item">
                  <span>日用币总额:</span>
                  <span class="price">{{ dailyTotal.toFixed(2) }}</span>
                </div>
                <div class="checkout-item" v-if="selectedItems.length > 0">
                  <span>已选商品:</span>
                  <span>{{ selectedItems.length }}件</span>
                </div>
              </div>
              <template #footer>
                <div class="dialog-footer">
                  <el-button @click="checkoutInfo = false">取消</el-button>
                  <el-button type="primary" @click="reCheckout">确认结算</el-button>
                </div>
              </template>
            </el-dialog>

            <!-- 确认移除对话框 -->
            <el-dialog
              v-model="removeConfirmVisible"
              title="确认移除"
              width="400px"
              class="checkout-dialog"
              :close-on-click-modal="false"
              :close-on-press-escape="false"
            >
              <div class="remove-confirm-content">
                <p>确定要从购物车中移除商品 "{{ itemToRemoveName }}" 吗？</p>
              </div>
              <template #footer>
                <div class="dialog-footer">
                  <el-button @click="cancelRemove">取消</el-button>
                  <el-button type="danger" @click="confirmRemove">确认移除</el-button>
                </div>
              </template>
            </el-dialog>
          </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import NavBar from '@/components/NavBar/index.vue'
  import { useCartStore } from '@/stores/cartStore';
  import { storeToRefs } from 'pinia';
  import { onMounted, ref, onBeforeMount } from 'vue';
  import isLogin from '@/api/isLogin'
  import { ElMessage, ElLoading } from 'element-plus';

  const cartStore = useCartStore();
  const { 
    cartItems, 
    filteredItems,
    selectedItems,
    clothingTotal,
    dailyTotal,
    checkoutInfo,
    isAllSelected,
    router,
  } = storeToRefs(cartStore);

  const { 
    getItem,
    getCurrency,
    removeSelectedItems,
    checkout,
    reCheckout,
    toggleSelectAll, 
    updateSelectedTotalPrice,
    formatPrice,
    toHome
  } = cartStore;

  // 节流函数实现
  const throttle = (fn, delay) => {
    let timer = null;
    let lastTime = 0;
    
    return function(...args) {
      const now = Date.now();
      const remaining = delay - (now - lastTime);
      
      if (remaining <= 0) {
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
        lastTime = now;
        fn.apply(this, args);
      } else if (!timer) {
        timer = setTimeout(() => {
          lastTime = Date.now();
          fn.apply(this, args);
          timer = null;
        }, remaining);
      }
    };
  };

  // 移除商品的确认对话框
  const removeConfirmVisible = ref(false);
  const itemToRemove = ref(null);
  const itemToRemoveName = ref('');

  // 显示移除确认对话框
  const showRemoveConfirmation = (goodsId) => {
    itemToRemove.value = goodsId;
    itemToRemoveName.value = filteredItems.value.find(item => item.goodsId === goodsId)?.goodsName || '';
    removeConfirmVisible.value = true;
  };

  // 确认移除
  const confirmRemove = () => {
    if (itemToRemove.value) {
      // 显示加载状态
      const loading = ElLoading.service({
        lock: true,
        text: '正在移除商品...',
        background: 'rgba(0, 0, 0, 0.7)'
      });
      
      // 调用store的移除方法，传入回调函数
      removeSelectedItems(itemToRemove.value, (success) => {
        loading.close();
        if (success) {
          // 移除成功
          removeConfirmVisible.value = false;
          itemToRemove.value = null;
          itemToRemoveName.value = '';
        } else {
          // 移除失败，保持对话框打开，用户可以重试或取消
          ElMessage.error({
            message: '移除商品失败，请重试',
            duration: 3000
          });
        }
      });
    }
  };

  // 取消移除
  const cancelRemove = () => {
    removeConfirmVisible.value = false;
    itemToRemove.value = null;
    itemToRemoveName.value = '';
  };

  // 使用节流函数包装handleQuantityChange
  const handleQuantityChange = (item, value) => {
    // 如果输入的数量超过库存限制，立即处理并显示警告
    if (value > item.limitNum) {
      value = item.limitNum;
      item.num = item.limitNum;
      ElMessage.warning({
        message: `商品"${item.goodsName}"的数量不能超过库存上限(${item.limitNum})`,
        duration: 3000,
        showClose: true,
        type: 'warning'
      });
    }
    
    updateSelectedTotalPrice(); // 更新总价
    cartStore.updateItemQuantity(item.goodsId, value); // 调用 Pinia 方法更新数量
  };

  // 应用节流处理，设置300ms的延迟
  const throttledQuantityChange = throttle(handleQuantityChange, 300);

  // 预加载关键字体
  const preloadFonts = () => {
    const fontFamilies = [
      "-apple-system", 
      "BlinkMacSystemFont", 
      "Segoe UI", 
      "Roboto", 
      "Helvetica Neue", 
      "Arial"
    ];
    
    // 创建一个不可见的div来预加载字体
    const preloadDiv = document.createElement('div');
    preloadDiv.style.opacity = '0';
    preloadDiv.style.position = 'absolute';
    preloadDiv.style.pointerEvents = 'none';
    preloadDiv.style.left = '-9999px';
    preloadDiv.style.top = '-9999px';
    preloadDiv.style.width = '0';
    preloadDiv.style.height = '0';
    
    // 对每个字体创建文本节点
    fontFamilies.forEach(font => {
      const span = document.createElement('span');
      span.style.fontFamily = font;
      span.textContent = "预加载字体";
      preloadDiv.appendChild(span);
    });
    
    // 添加到body中然后立即移除
    document.body.appendChild(preloadDiv);
    setTimeout(() => {
      document.body.removeChild(preloadDiv);
    }, 100);
  };

  onBeforeMount(() => {
    preloadFonts();
  });

  onMounted(() => {
    console.log('开始挂载')
    // 在组件挂载时获取购物车信息和用户余额
    getItem();
    getCurrency();
    isLogin();
    
    // 定期刷新购物车列表，确保数据同步
    const refreshInterval = setInterval(() => {
      getItem();
    }, 10000); // 每10秒刷新一次
    
    // 组件卸载时清除定时器
    return () => {
      clearInterval(refreshInterval);
    };
  });  

  // 确保全选功能正常
  const handleSelectAll = (val) => {
    toggleSelectAll(val);
  };

  // 确保单个选择正常
  const handleItemSelect = () => {
    updateSelectedTotalPrice();
  };
</script> 


<style lang="css" scoped>
/* 字体预加载与稳定性设置 */
@font-face {
  font-family: "system-ui";
  src: local("-apple-system"), local("BlinkMacSystemFont"), local("Segoe UI"),
       local("Roboto"), local("Helvetica Neue"), local("Arial");
  font-display: swap;
  size-adjust: 100%;
  ascent-override: 90%;
  descent-override: 10%;
}

:root {
  font-family: "system-ui", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, 
    "Helvetica Neue", Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 关键内容预留空间防止布局偏移 */
h3, p, span {
  margin: 0;
  padding: 0;
}

/* 为各种尺寸设置固定比例 */
*, *::before, *::after {
  box-sizing: border-box;
}

/* 整体页面样式 */
.cart-card {
  border-radius: 16px;
  padding: 40px;
  width: 100%;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  margin: 24px auto;
  justify-content: center;
  background-color: #f5f5f7;
  color: #1d1d1f;
  max-width: 1200px;
  min-height: 200px; /* 保持最小高度 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 顶部容器 */
.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding: 0 20px;
  border-bottom: 1px solid #e5e5e5;
  padding-bottom: 16px;
}

.selected-count {
  background-color: #000000; /* Nike风格黑色 */
  color: white;
  padding: 8px 18px;
  border-radius: 24px;
  font-weight: 500;
  font-size: 14px;
  letter-spacing: 0.5px;
}

.cart-container {
  padding: 0;
}

/* 调整全选选择框 */
.choose {
  font-size: 16px;
  color: #1d1d1f;
  font-weight: 500;
}

.choose :deep(.el-checkbox__input) {
  transform: scale(1.6);
  margin-right: 12px;
}

.choose :deep(.el-checkbox__label) {
  font-size: 15px;
  letter-spacing: 0.3px;
}

/* 商品卡片容器 */
.card-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* 商品卡片样式 */
.item-card {
  width: 100%;
  max-width: 1000px;
  height: 180px; /* 固定高度而非最小高度 */
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  display: flex;
  align-items: center;
  background-color: #ffffff;
  border: 1px solid #f0f0f0;
  margin-bottom: 16px;
  box-sizing: border-box;
  overflow: hidden; /* 防止内容溢出导致布局变化 */
}

/* 商品卡片选中状态 */
.item-selected {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e2e2;
}

.item-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

/* 增大商品选择框 */
.item-card :deep(.el-checkbox__input) {
  transform: scale(1.6);
  margin-right: 24px;
}

/* 商品图片容器 */
.item-image-container {
  width: 130px;
  height: 130px;
  flex-shrink: 0; /* 防止压缩 */
  flex-grow: 0; /* 防止拉伸 */
  margin-right: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  background-color: #f9f9f9;
  overflow: hidden;
}

.item-image {
  width: 85%;
  height: 85%;
  object-fit: contain;
}

.item-image-container:hover .item-image {
  transform: scale(1.08);
}

/* 商品信息布局 */
.item-info {
  display: flex;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  min-width: 0;
  height: 100%; /* 确保高度一致 */
}

.item-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  flex: 1;
  height: 100%; /* 确保高度一致 */
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: flex-end;
  width: 120px; /* 固定宽度 */
  flex-shrink: 0; /* 防止压缩 */
}

/* 商品名称样式 */
.item-name {
  font-size: 17px;
  line-height: 1.3;
  height: 22px; /* 固定高度 */
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
  color: #1d1d1f;
}

/* 商品价格样式 */
.item-price {
  font-size: 24px;
  font-weight: 500;
  margin: 4px 0 8px 0;
  height: 30px; /* 固定高度 */
  color: #000000;
  line-height: 1.2;
}

/* 货币类型标签 */
.currency-type {
  font-size: 13px;
  color: #6e6e73;
  background-color: #f5f5f7;
  border-radius: 20px;
  padding: 6px 14px;
  display: inline-block;
  font-weight: 500;
  height: 28px; /* 固定高度 */
  line-height: 16px; /* 垂直居中文本 */
}

/* 数量选择器 */
.item-card :deep(.el-input-number) {
  border-radius: 8px;
  overflow: hidden;
}

.item-card :deep(.el-input-number .el-input__inner) {
  font-size: 15px;
  color: #1d1d1f;
  text-align: center;
}

.item-card :deep(.el-input-number__decrease),
.item-card :deep(.el-input-number__increase) {
  background-color: #f5f5f7;
  color: #1d1d1f;
  border-color: #e5e5e5;
}

/* 移除按钮 */
.remove {
  width: 70px; /* 固定宽度 */
  height: 36px; /* 固定高度 */
  color: white;
  font-size: 14px;
  border-radius: 24px;
  padding: 8px 16px;
  background: #000000;
  border: none;
  font-weight: 500;
  transition: all 0.3s ease;
  white-space: nowrap;
  text-align: center;
  line-height: 20px; /* 垂直居中文本 */
}

.remove:hover {
  background: #333333;
  transform: translateY(-2px);
}

/* 底部结算区域 */
.foot {
  display: flex;
  align-items: center;
  margin-top: 40px;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  width: 100%;
  max-width: 1020px;
  height: 80px; /* 固定高度而非最小高度 */
  margin-left: auto;
  margin-right: auto;
}

/* 调整左侧区域 */
.foot-left {
  display: flex;
  align-items: center;
  flex: 1; /* 增加全选区域的比例 */
}

/* 调整中间区域 */
.foot-middle {
  display: flex;
  flex: 1.1; /* 略微增加币值显示区域的比例 */
  justify-content: flex-end; /* 向右对齐，紧挨着结算按钮 */
  padding-right: 0; /* 移除与结算按钮的间距 */
}

/* 调整右侧区域 */
.foot-right {
  flex: 0.7; /* 减小结算按钮区域比例 */
  display: flex;
  justify-content: flex-end; /* 结算按钮靠右 */
  padding-left: 0; /* 移除左侧内边距 */
}

/* 货币信息样式 */
.currency-info {
  display: flex;
  flex-direction: row;
  gap: 15px;
  align-items: center;
  justify-content: flex-end;
  height: 24px; /* 固定高度 */
}

.currency-info span {
  font-size: 16px;
  font-weight: 600;
  color: #1d1d1f;
  white-space: nowrap;
  height: 24px; /* 固定高度 */
  line-height: 24px; /* 垂直居中文本 */
}

/* 全选选择框样式 */
.choose {
  font-size: 16px;
  color: #1d1d1f;
  font-weight: 500;
}

.choose :deep(.el-checkbox__input) {
  transform: scale(1.6);
  margin-right: 12px;
}

.choose :deep(.el-checkbox__label) {
  font-size: 15px;
  letter-spacing: 0.3px;
}

/* 移除旧的总额显示样式 */
.cart-total {
  display: none;
}

/* 恢复结算按钮原样式并增大 */
.checkout-button {
  width: 160px; /* 固定宽度 */
  height: 52px; /* 固定高度 */
  background: #000000;
  color: #fff;
  font-size: 20px;
  padding: 0 16px;
  border-radius: 30px;
  border: none;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkout-button:hover {
  background: #333333;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.checkout-button[disabled] {
  background: #a1a1a6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 空购物车样式 */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 40px;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05);
  margin: 40px 0;
  height: 400px; /* 固定高度而非最小高度 */
}

.empty-cart-image {
  width: 150px;
  height: 150px; /* 固定高度 */
  margin-bottom: 40px;
  opacity: 0.8;
}

.empty-cart-text {
  font-size: 28px;
  font-weight: 600;
  color: #1d1d1f;
  margin-bottom: 30px;
  height: 36px; /* 固定高度 */
  line-height: 36px; /* 垂直居中文本 */
}

.empty-cart-button {
  font-size: 16px;
  color: #fff;
  background-color: #000000;
  border: none;
  padding: 14px 32px;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  letter-spacing: 0.7px;
}

.empty-cart-button:hover {
  background-color: #333333;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* 结算弹窗样式 */
.checkout-dialog :deep(.el-dialog) {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
}

.checkout-dialog :deep(.el-dialog__header) {
  background-color: #000000;
  color: white;
  padding: 20px;
  text-align: center;
}

.checkout-dialog :deep(.el-dialog__title) {
  color: white;
  font-weight: 500;
  font-size: 18px;
  letter-spacing: 0.7px;
}

.checkout-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
  color: rgba(255, 255, 255, 0.9);
}

.checkout-dialog :deep(.el-dialog__body) {
  padding: 30px;
}

.checkout-details {
  padding: 10px 0;
}

.checkout-item {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 16px;
  color: #1d1d1f;
}

.checkout-item:last-child {
  border-bottom: none;
  margin-top: 8px;
  background-color: #f5f5f7;
  border-radius: 12px;
  padding: 18px 16px;
}

.checkout-item .price {
  font-weight: 600;
  color: #000000;
  font-size: 17px;
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  padding-top: 20px;
}

.dialog-footer :deep(.el-button) {
  border-radius: 30px;
  padding: 12px 26px;
  font-size: 15px;
  letter-spacing: 0.5px;
}

.dialog-footer :deep(.el-button--default) {
  border-color: #d2d2d7;
  color: #1d1d1f;
}

.dialog-footer :deep(.el-button--primary) {
  background-color: #000000;
  border-color: #000000;
}

.dialog-footer :deep(.el-button--primary:hover) {
  background-color: #333333;
  border-color: #333333;
}

/* 确认移除对话框样式 */
.remove-confirm-content {
  padding: 10px 0;
  text-align: center;
}

.remove-confirm-content p {
  font-size: 16px;
  color: #1d1d1f;
}

/* 优雅的动画效果 */
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-15px);
  }
}

/* 确保复选框可点击 */
.item-card :deep(.el-checkbox),
.choose :deep(.el-checkbox) {
  pointer-events: auto;
  cursor: pointer;
}

.item-card :deep(.el-checkbox__input),
.choose :deep(.el-checkbox__input) {
  z-index: 2;
  pointer-events: auto;
}

/* 确保所有文本元素有固定行高 */
.el-text {
  line-height: 1.4;
  display: block;
}

.quantity-input {
  width: 120px;
  height: 36px; /* 固定高度 */
  margin-bottom: 15px;
}
</style>
