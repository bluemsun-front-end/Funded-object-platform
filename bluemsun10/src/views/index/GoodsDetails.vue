<template>
  <section id="productDetailModal" class="modal">
    <div class="modal-content">
      <div class="title">
        <h2 id="productName">商品详情</h2>
       <span class="close" @click="close">&times;</span>
      </div>
      <div class="all-content">
        <img id="productImage" :src="productDetail.imageUrlUrl" alt="商品图片">
        <div class="intro">
          <h2 id="productDescription">{{ productDetail.name }}</h2>
          <br>
          <span id="name"><el-text class="mx-1" size="large">商品介绍:{{ productDetail.intro }}</el-text></span>
          <br>
          <span id="number"><el-text class="mx-1" type="danger" size="large">库存:{{ productDetail.amount }}</el-text></span>
          <br>
          <span id="con-price"><el-text class="mx-1">价格:{{ productDetail.currencyType }} {{ productDetail.price }}</el-text></span>
          <br>
          <div class="count">
            <div class="update">
              <span><el-text class="mx-1">数量：</el-text></span>
            <el-input-number
            size="small"
            v-model="num"
            :min="1"
            :max="productDetail.amount > 0 ? productDetail.amount : 1"
            :disabled="productDetail.amount === 0"
            @change="handleChange" />
            <el-button class="add" type="primary" round :disabled="productDetail.amount === 0" @click="addToCart">加入购物车</el-button>
            </div>
          </div>
          <br>
          <div class="btn-box">
            <div class="mb-4">
              
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
 
</template>

<script setup>
import { ref, watch, defineEmits } from 'vue';
import Axios from '../Axios/index';
import { ElMessage } from 'element-plus';

const num = ref(1)
const handleChange = (value) => {
  console.log(value)
}

const emit = defineEmits();

const props = defineProps({
  productDetail: {
    type: Object,
    required: true,
  },
});

const productDetail = ref(props.productDetail);

watch(() => props.productDetail, (newVal) => {
  productDetail.value = newVal;
}, { immediate: true });

const addToCart = () => {
  if (productDetail.value.amount > 0) {
    const payload = {
      goodsId: productDetail.value.id,
      num: num.value
    };
    Axios.post('http://106.54.24.243:8080/market/cart', payload)
      .then(response => {
        if (response.data.code ===500) {
          ElMessage.error(response.data.msg);
          console.log('商品下架', response);
        } 
        else if(response.data.code ===200){
          console.log('加入购物车成功', response);
          ElMessage.success('加入购物车成功');
        }
        else if(response.data.code ===401){
          ElMessage.error('认证失败');
        }
        else if(response.data.code ===403){
          ElMessage.error('您没有此权限');
        }
      })
      .catch(error => {
        console.error('加入购物车失败', error);
        ElMessage.error('加入购物车失败');
      });
  } 
  else {
    ElMessage.error('库存不足，无法加入购物车');
  }
};

// 关闭弹框的方法
const close = () => {
  emit('close'); 
};


</script>

<style scoped>
body {
  font-family: 'Open Sans', sans-serif;
  background-color: #f4f4f4;
  color: #333;
}

.modal {
    position: fixed;
    z-index: 100;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(22, 22, 22, 0.469);
}

.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    width: 80%;
    max-width: 700px;
}
.all-content{
  display:flex;
  flex-direction: row;
}
.intro{
  display:flex;
  flex-direction: column;
  margin-left:30px;
  margin-bottom:0px;
}
.count{
  display:flex;
  flex-direction: row;
}

#productImage {
  width: 200px; /* 或者其他固定宽度 */
  height: 200px;
  border-radius: 4px;
  margin-bottom: 0; /* 移除底部边距 */
  margin-top:10px;
}

#productDescription, #name, #number, #con-price {
  font-size: 16px;
  color: #333;
  /* margin-bottom: 10px; */
}

.count, .btn-box {
  margin-top: 0; /* 移除顶部边距 */
}

.update {
  margin-right: 10px;
}

.el-input-number {
  width: auto; /* 自适应宽度 */
}

.el-button {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
  padding: 10px 20px;
  border-radius: 4px;
  font-size: 16px;
  width: auto; /* 自适应宽度 */
}

.el-button:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}
.add{
  margin-left:60px;
}
.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
}

.close:hover,
.close:focus {
    color: rgb(51.2, 126.4, 204);
    text-decoration: none;
    cursor: pointer;
}
#productName{
  width:100px;
}
.title{
  display:flex;
  flex-direction: row;
  justify-content: space-between;
}
/* 响应式设计 */
@media (max-width: 768px) {
  .modal-content {
    width: 60%;
    margin: 50px auto;
  }
  .modal{
    height:100vh;
  }
  .all-content{
    flex-direction: column;
    align-items: center;
  }

  .intro{
    margin-left:0px;
  }

  .count{
    justify-content: center;
  }

  .add{
    margin-left:0px;
    margin-top:10px;
  }
}
</style>