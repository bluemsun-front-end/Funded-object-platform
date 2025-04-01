import { defineStore } from 'pinia';
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import Axios from '../views/Axios';
import { useRouter } from 'vue-router';

export const useCartStore = defineStore('cartStore', () => {

    const cartItems: any = ref([]);
    const filteredItems: any = ref([...cartItems.value]);
    const selectedItems: any = ref([]);
    const userBalance: any = ref([]);
    const checkoutInfo: any = ref(false);  // 用于控制弹窗的显示
    const isAllSelected: any = ref(false);

    // 定义路由
    const router = useRouter(); 
    
    const toHome = () => {
        console.log('跳转');
        router.push('/home');
    };

    // 获取用户购物车商品
    async function getItem() {
        Axios.get('http://106.54.24.243:8080/market/cart/list')
        .then(function (response) { 
            console.log('getItem', response.data.data);
            // 处理可能的重复项
            const cartData = response.data.data || [];
            if (cartData.length > 0) {
                // 使用Map按goodsId分组，合并相同商品
                const groupedItems = new Map();
                
                cartData.forEach((item: any) => {
                    if (groupedItems.has(item.goodsId)) {
                        // 如果已存在该商品，合并数量
                        const existingItem = groupedItems.get(item.goodsId);
                        existingItem.num += item.num;
                        
                        // 确保数量不超过库存限制
                        if (existingItem.num > existingItem.limitNum) {
                            existingItem.num = existingItem.limitNum;
                        }
                        
                        groupedItems.set(item.goodsId, existingItem);
                    } else {
                        // 添加新商品
                        groupedItems.set(item.goodsId, {...item});
                    }
                });
                
                // 将Map转回数组
                cartItems.value = Array.from(groupedItems.values());
            } else {
                cartItems.value = [];
            }
            
            filteredItems.value = [...cartItems.value];
        })
        .catch(function (error) {
            console.log(error);
        });
    }

    // 获取用户余额
    async function getCurrency() {      
        Axios.get('http://106.54.24.243:8080/market/balance')
        .then(function (response) {
            userBalance.value = response.data.data;
            console.log('userBalance', userBalance.value);
        })
        .catch(function (error) {
            console.log(error);
        }); 
    }

    // 计算服装币和日用币的总价
    const clothingTotal = computed(() => {
        return selectedItems.value.reduce((total: number, id: any) => {
            const item = cartItems.value.find((item: { goodsId: any; currencyType: string; }) => item.goodsId === id && item.currencyType === '1');
            return total + (item ? item.price * item.num : 0);
        }, 0);
    });

    const dailyTotal = computed(() => {
        return selectedItems.value.reduce((total: number, id: any) => {
            const item = cartItems.value.find((item: { goodsId: any; currencyType: string; }) => item.goodsId === id && item.currencyType === '0');
            return total + (item ? item.price * item.num : 0);
        }, 0);
    });

    // 移除选中的商品
    const removeSelectedItems = async (itemId: any, callback?: Function) => {
        var removeItem = { ids: [itemId] };
        try {
            // 先向用户显示正在处理
            ElMessage.info({
                message: '正在移除商品...',
                duration: 1000
            });
            
            const response = await Axios.delete(`http://106.54.24.243:8080/market/cart/${removeItem.ids.join(',')}`);
        
            if (response.data.code == 200) {
                // 更新本地数据
                cartItems.value = cartItems.value.filter((item: { goodsId: any; }) => item.goodsId !== itemId);
                filteredItems.value = filteredItems.value.filter((item: { goodsId: any; }) => item.goodsId !== itemId);
                
                // 从选中列表中移除该商品
                if (selectedItems.value.includes(itemId)) {
                    selectedItems.value = selectedItems.value.filter((id: any) => id !== itemId);
                }
                
                ElMessage.success({
                    message: '商品已成功移除',
                    duration: 2000
                });
                
                // 如果有回调函数，则执行
                if (callback && typeof callback === 'function') {
                    callback(true);
                }
            } else {
                ElMessage.warning({
                    message: '删除商品失败，请稍后重试！',
                    duration: 3000
                });
                
                // 如果有回调函数，则执行
                if (callback && typeof callback === 'function') {
                    callback(false);
                }
            }
        } catch (error) {
            console.error('删除商品时出错:', error);
            ElMessage.error({
                message: '删除商品时出现错误！',
                duration: 3000
            });
            
            // 如果有回调函数，则执行
            if (callback && typeof callback === 'function') {
                callback(false);
            }
        }
    };

    // 更新选中商品的总价
    const updateSelectedTotalPrice = () => {
        // 计算总价会自动更新，因为使用了计算属性
    };

    // 格式化价格
    const formatPrice = (row: { price: number; }) => {
        return `¥${row.price.toFixed(2)}`;
    };

    // 显示结算信息（打开弹窗）
    const checkout = () => {
        if (selectedItems.value.length > 0) {
            checkoutInfo.value = true;  // 显示弹窗
        } else {
            ElMessage.warning('购物车没有选中的商品，无法结算！');
        }
    };

    // 确认结算
    const reCheckout = async () => {
        const selectedItemsData = selectedItems.value.map((id: any) => {
            const item = cartItems.value.find((item: { goodsId: any; }) => item.goodsId === id);
            return {
                goodsId: item.goodsId,
                num: item.num,
            };
        });
    
        const payload = {
            carts: selectedItemsData, // 形成请求体
        };
    
        try {
            const response = await Axios.post('http://106.54.24.243:8080/market/cart/settle', payload);
            console.log('结算response', response); 
            console.log('response.data.code', response.data.code);
            if (response.data.code == 200 && userBalance.value.clothingBalance >= clothingTotal.value && userBalance.value.generalBalance >= dailyTotal.value) {
                // 结算成功的处理逻辑
                userBalance.value.clothingBalance -= clothingTotal.value;
                userBalance.value.generalBalance -= dailyTotal.value;
                filteredItems.value = [];
                selectedItems.value = [];
                checkoutInfo.value = false; // 结算后关闭弹窗
                ElMessage.success('结算成功');
                getCurrency();
                getItem();
    
                isAllSelected.value = false; // 取消全选状态
            } else if (response.data.code == 500) {  
                const warning = response.data.msg;
                ElMessage.warning(warning);
            } else if (userBalance.value.clothingBalance < clothingTotal.value || userBalance.value.generalBalance < dailyTotal.value) {
                ElMessage.warning('余额不足');
            }
        } catch (error) {
            console.error(error);
            ElMessage.error('结算过程中出现错误！');
        }
    };

    // 切换全选状态
    const toggleSelectAll = () => {
        if (isAllSelected.value) {
            selectedItems.value = filteredItems.value.map((item: { goodsId: any; }) => item.goodsId);
        } else {
            selectedItems.value = [];
        }
    };

    // 监听 selectedItems 变化，更新全选按钮的状态
    watch(selectedItems, (newSelectedItems) => {
        isAllSelected.value = newSelectedItems.length === filteredItems.value.length;
    });  


    //修改购物车数量 

    // 更新商品数量的方法
const updateItemQuantity = async (itemId: number, newQuantity: number) => {
    try {
        // 找到对应的商品
        const item = cartItems.value.find((item: { goodsId: number }) => item.goodsId === itemId);
        if (!item) {
            ElMessage.warning('商品不存在');
            return;
        }

        // 首先获取最新的商品库存信息
        try {
            const stockResponse = await Axios.get(`http://106.54.24.243:8080/market/goods/${item.goodsId}`);
            if (stockResponse.data.code === 200 && stockResponse.data.data) {
                const currentStock = stockResponse.data.data.amount;
                
                // 检查请求的数量是否超过最新库存
                if (newQuantity > currentStock) {
                    ElMessage.warning(`商品库存不足，最多只能添加${currentStock}个`);
                    newQuantity = currentStock;
                    item.limitNum = currentStock; // 更新本地限制
                }
            }
        } catch (error) {
            console.error('获取最新库存信息失败:', error);
        }

        // 请求体结构
        const payload = {
            goodsId: item.goodsId,
            num: newQuantity,
            imgUrl: item.imageUrlUrl,
            goodsName: item.goodsName,
        };

        // 调用后端接口更新数量
        const response = await Axios.put('http://106.54.24.243:8080/market/cart', payload);

        if (response.data.code === 200) {
            // 更新本地数据
            item.num = newQuantity;
            ElMessage.success('商品数量已更新');
        } else {
            ElMessage.warning(response.data.msg || '更新商品数量失败，请稍后重试！');
        }
    } catch (error) {
        console.error('更新商品数量时出错:', error);
        ElMessage.error('更新商品数量时出现错误！');
    }
};


    return {
        router,
        cartItems, 
        filteredItems,
        selectedItems,
        userBalance,
        clothingTotal,
        dailyTotal,
        checkoutInfo,
        isAllSelected,
        getItem,
        getCurrency,
        removeSelectedItems,
        checkout,
        reCheckout,
        toggleSelectAll, 
        updateSelectedTotalPrice,
        formatPrice,
        toHome,
        updateItemQuantity,
       
    }
});
