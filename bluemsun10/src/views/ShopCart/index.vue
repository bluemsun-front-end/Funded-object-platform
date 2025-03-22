<template> 

  <div>
    <NavBar />
    <div class="cart-card">
      <div class="cart-container">
       
          <!-- 全选按钮 -->
          <div>
            <el-checkbox class="choose" v-model="isAllSelected" @change="toggleSelectAll">全选</el-checkbox>
          </div>
          
          <div class="card-container">
            <!-- 商品卡片 -->
            <div v-for="item in filteredItems" :key="item.goodsId" class="item-card">
              <el-checkbox
                v-model="selectedItems"
                @change="updateSelectedTotalPrice"
                :value="item.goodsId" /> 

                <div class="item-image-container">

                  <img :src="item.imageUrlUrl" alt="商品图片" class="item-image" /> 

               <div class="zoom-card">
                    <img class="zoom-image" :src=item.imageUrlUrl alt="放大图片" />
               </div> 

                </div>
            

              <div class="item-info">
                <el-tooltip :content=item.goodsName  placement="top">
                  <h3 class="item-name">{{ item.goodsName }}</h3> 
              
                </el-tooltip> 
               
                <p class="item-price">{{ formatPrice(item) }}</p>
                <el-input-number
                  v-model="item.num"
                  :min="1"
                  :max="item.limitNum"
                 @change="(value) => handleQuantityChange(item, value)"
                  class="quantity-input"
                />
                <p class="currency-type">货币类型: {{ item.currencyType === '0' ? '日用币' : '服装币' }}</p>
                <el-button type="danger" @click="removeSelectedItems(item.goodsId)" class="remove">移除</el-button>
              </div>
            </div> 

            

          </div>
          
          <!-- 购物车为空的展示 -->
          <div v-if="filteredItems.length === 0" class="empty-cart">
            <img src="../background/emptyCart.png" alt="空购物车" class="empty-cart-image">
            <p class="empty-cart-text">您的购物车是空的</p>
            <el-button type="primary" class="empty-cart-button" @click="toHome">继续购物</el-button>
          </div>

          <!-- 结算信息 -->
       

          <!-- 底部结算按钮 -->
      <div class="foot">
          <div class="cart-total">
               <strong>服装币: ¥{{ clothingTotal.toFixed(2) }}</strong>
             <br />
               <strong>日用币: ¥{{ dailyTotal.toFixed(2) }}</strong>
          </div>
  
          <div class="spacing"></div>

            <div class="button-group">
              <el-button type="success" @click="checkout" class="success">结算 </el-button> 

      
              <!-- 确认结算 --> 
              <el-dialog
            v-model="checkoutInfo"
            title="确认结算"
            width="500px"
        >
            <div>
                <p>服装币总额: ¥{{ clothingTotal.toFixed(2) }}</p>
                <p>日用币总额: ¥{{ dailyTotal.toFixed(2) }}</p>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="checkoutInfo = false">取消</el-button>
                <el-button type="primary" @click="reCheckout">确认结算</el-button>
            </span>
        </el-dialog>




            </div>
          </div>
        
      </div>
    </div>
  </div>
</template>

<script setup>
  import NavBar from '@/components/NavBar/index.vue'
  import { useCartStore } from '@/stores/cartStore';
  import { storeToRefs } from 'pinia';
  import { onMounted } from 'vue';
  import isLogin from '@/api/isLogin'

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

  onMounted(() => {
    console.log('开始挂载')
    getItem();
    getCurrency();
    isLogin();  
  });  


  const handleQuantityChange = (item, value) => {
  cartStore.updateSelectedTotalPrice(); // 更新总价
  cartStore.updateItemQuantity(item.goodsId, value); // 调用 Pinia 方法更新数量
};

</script> 


<style lang="css" scoped>
/* 总价的样式 */ 





.cart-card {
  border-radius: 10px;
  padding: 25px; 
  width: 100%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin: 15px;
  justify-content: center; 
  background-color: #bdbdbd; /* 中性灰 */
  color: #F5F5F5; /* 接近黑色的文字，清晰对比 */
}

.cart-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);

}

.foot {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-right: 15vw;
}

.cart-total {
  background: linear-gradient(135deg, #f9f9f9, #e0e0e0); /* 柔和的渐变背景 */
  border-radius: 8px; /* 圆角 */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1); /* 柔和的阴影 */
  padding: 15px 30px; /* 内边距 */
  font-size: 1.4rem; /* 文字大小 */
  font-family: 'Roboto', sans-serif; /* 现代字体 */
  font-weight: 500; /* 半粗字体 */
  color: #333; /* 深灰文字 */
  text-align: right; /* 右对齐 */
  letter-spacing: 1px; /* 增大字间距 */
  line-height: 1.6; /* 增大行高 */
  margin-top: 25px; /* 与上方内容保持间距 */
}

.cart-total strong {
  font-weight: 700; /* 加粗总价 */
  color: #000; /* 黑色突出显示 */
}

.cart-total:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); /* 鼠标悬浮时的投影 */
}

.spacing {
  height: 20px; /* 设置间距高度 */
}

.choose {
  margin-left: 15vw;
  font-size: 1.1rem;
  color: #555;
}

/* 购物车商品样式 */
.card-container {
  position: relative; /* 相对定位，确保内容层次清晰 */
  z-index: 10; /* 确保商品内容位于背景图之上 */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px; /* 商品之间的间距**/
}


.item-card {
  width: 100%;
  max-width: 1000px;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  position: relative; /* 添加相对定位，方便子元素绝对定位 */ 
   background-color: #ffffff;

}

.item-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}



.item-image-container {
  position: relative;
  width: 200px; /* 商品图片的宽度 */
  height: 200px; /* 商品图片的高度 */
  margin-right: 30px; /* 右侧留空白，避免与右侧信息重叠 */
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center; /* 垂直居中 */
  border-radius: 10px; /* 圆角 */
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保证图片比例填充容器 */
  border-radius: 10px; /* 与容器保持一致 */
  transition: transform 0.3s ease; /* 平滑过渡 */
}


.zoom-card {
  position: absolute;
  top: 0;
  right: -300px; /* 放大卡片位于图片的右侧 */
  width: 300px; /* 放大卡片的宽度 */
 
  border-radius: 13px;
  display: none; /* 默认隐藏 */
 
  justify-content: center;
  align-items: center;

} 

.zoom-image {
  width: 100%;
  object-fit: cover;
  border-radius: 20px;
}

/* 鼠标悬停在商品图片上时的效果 */
.item-image-container:hover .zoom-card {
  display: flex; /* 显示放大卡片 */
}



.item-image-container:hover .zoom-image {
  width: 260px; /* 固定宽度 */
 height: 210px;
  object-fit: cover; /* 确保图片比例适配 */
  transition: width 0.3s ease, height 0.3s ease; /* 平滑过渡效果 */
}

.item-info {
  display: flex;
  flex-direction: row;
  gap: 150px; 
  justify-content: space-between;
  text-align: left; 
  align-items: center;
}

.item-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #4CAF50; /* 保持绿色 */
  letter-spacing: 0.7px;
  line-height: 1.4; /* 增加行高，使文字不堆在一起 */ 
  max-width: 200px; /* 限制最大宽度 */
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-price {
  font-size: 1.2rem;
  font-weight: 500;
  color: #FF5722; /* 商品价格橙色 */
  margin-top: 0; /* 紧贴商品名称 */
}

.quantity-input {
  width: 110px;
}

.currency-type {
  font-size: 1.1rem;
  color: #888;
  margin-top: 5px;
  line-height: 1.4; /* 增加行高 */
  position: absolute; /* 设置为绝对定位 */
  top: 10px;  /* 定位到卡片的右上角 */
  right: 10px; /* 定位到卡片的右上角 */
} 


.el-button {
  font-size: 1rem;
  border-radius: 6px;
  padding: 10px 20px;
}

.remove {

  color: white;
  font-size: 1rem;
  border-radius: 6px;
  padding: 10px 20px;
  position: absolute; /* 设置为绝对定位 */
  bottom: 10px; /* 定位到卡片的右下角 */
  right: 10px;  /* 定位到卡片的右下角 */
}



/* 购物车为空的样式 */
.empty-cart {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 50px;
  color: #666;
  text-align: center;
  background-color: #ffffff; /* 调整为浅黄色背景 */
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.empty-cart-image {
  width: 180px;
  height: auto;
  margin-bottom: 30px;
  animation: bounce 1.5s infinite;
}

.empty-cart-text {
  font-size: 2rem;
  font-weight: 700;
  color: #FF5722; /* 调整为橙色 */
  margin-bottom: 25px;
}

.empty-cart-button {
  font-size: 1.1rem;
  color: #fff;
  background-color: #81C784; /* 调整为紫色背景 */
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.empty-cart-button:hover {
  background-color: #4CAF50; /* 调整为更深的紫色背景 */
}

.checkout-info {
  margin-left: 15vw;
  margin-top: 25px;
  margin-bottom: 25px;
}

.checkout-total {
  margin: 25px 0;
}

.success {
  background: linear-gradient(45deg, #4CAF50, #81C784); /* 调整为绿色渐变 */
  color: #fff;
  transition: background-position 0.5s;
}

.success:hover {
  background-position: right center;
}




.checkout-button:hover {
  background: linear-gradient(45deg, #43A047, #66BB6A); /* 鼠标悬浮时的颜色变化 */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2); /* 悬浮阴影 */
  transform: scale(1.02); /* 微缩放效果 */
}


/* 动画效果 */
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}
</style>
