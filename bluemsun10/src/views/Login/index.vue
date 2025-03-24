<template>
    <div :class="container">
      <form v-if="isPc" class="pc">
        <div class="form_left">
          <h1>资助统一身份认证</h1>
          <!-- <h3>账号登录</h3> -->
          <div class="uname">
            <div>
              <el-icon :size="24"><User /></el-icon>
            </div>
            <input type="text" placeholder="学号" v-model="uname" />
          </div>
          <div class="password">
            <div>
              <el-icon :size="24"><Unlock /></el-icon>
            </div>
            <input type="password" placeholder="密码" v-model="password" />
          </div>
          <div class="remenber">
            <el-checkbox v-model="remenber" label="记住密码" size="large" fill="#f5f5f5" />
          </div>
          <div class="btn"><button class="log" @click.prevent="log">登录</button></div>
        </div>
      </form>
      <form v-if="isPc===false" class="mobile">
          <h1>资助统一身份认证</h1>
          <!-- <h3>账号登录</h3> -->
          <div class="uname">
            <div>
              <el-icon :size="24"><User /></el-icon>
            </div>
            <input type="text" placeholder="学号" v-model="uname" />
          </div>
          <div class="password">
            <div>
              <el-icon :size="24"><Unlock /></el-icon>
            </div>
            <input type="password" placeholder="密码" v-model="password" />
          </div>
          <div class="remenber">
            <el-checkbox v-model="remenber" label="记住密码" size="large" fill="#f5f5f5" />
          </div>
          <div class="btn"><button class="log" @click.prevent="log">登录</button></div>
      </form>
    </div>
</template>

<script setup>
import { onMounted, ref,watch } from 'vue'
import axios from 'axios'
import { ElForm, ElFormItem, ElInput, ElButton, ElCheckbox, ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { User,Unlock } from '@element-plus/icons-vue'
import isLogin from '@/api/isLogin'
let container="container container1"
const router = useRouter()
// 表单数据和状态
const uname = ref('')
const password = ref('')
const remenber = ref(true)
const loading = ref(false)
// const clientId = ref('')
const token=localStorage.getItem('token');
const role =localStorage.getItem('role')
const redirect = router.currentRoute.value.query.redirect
// 定义一个响应式变量来存储客户端ID
const clientId = ref('');
// 定义一个变量来判断是电脑端还是移动端
let isPc = true;
// 定义一个函数来判断是否是电脑端
const isPC = () => {
  const userAgent = navigator.userAgent;

  // 定义一些常见的移动设备和浏览器的用户代理特征
  const mobileAgents = [
    /android/i,     // Android设备
    /iphone|ipad|ipod/i, // iOS设备
    /windows phone/i, // Windows Phone设备
    /blackberry/i,  // Blackberry设备
    /opera mini/i,  // Opera Mini浏览器（通常用于移动设备）
    /mobile/i,      // 通用移动设备标记
    /touch/i        // 触摸设备标记（可能包括桌面触摸屏）
  ];

  // 初始化isPc为true
  isPc = true;

  // 检查用户代理字符串是否包含任何移动设备的特征
  for (let i = 0; i < mobileAgents.length; i++) {
    if (mobileAgents[i].test(userAgent)) {
      isPc = false; // 如果是移动设备，则将isPc设置为false
    }
  }
  console.log(isPc);
      //改变clientId查看是移动端还是PC端
    if (isPc == false) {
      clientId.value = '428a8310cd442757ae699df5d894f051'
    } else {
      clientId.value = 'e5cd7e4891bf95d1d19206ce24a7b32e'
    }
 localStorage.setItem('client_id',clientId.value)
};


onMounted(
async() => {
   isPC()
   if(isPc===false)
      container="container container2"
   else
      container="container container1"
 const isLoggedin=await isLogin();
  if(!isLoggedin)
  {
    localStorage.removeItem('role')
    localStorage.removeItem('token')
  }


  // if(redirect&&token&&role)
  //   {
  //     console.log('redirect', redirect)
  //      window.location.href = `${redirect}?token=${token}&role=${role}`
  //   }
})



// watch(clientId, (newValue, oldValue) => {
//   // location.reload()
// });

const log = async () => {
  try {
    loading.value = true
    const config = {
      headers: {
    'content-language': 'zh_CN'
  }
};
    const response = await axios.post('http://106.54.24.243:8080/auth/login', {
      tenantId: '000000',
      username: uname.value,
      password: password.value,
      rememberMe: remenber.value,
      clientId: clientId.value,
      grantType: 'password',
    }, config)



    if (response.data.code === 200) {
      ElMessage.success('登录成功')
      localStorage.setItem('token', response.data.data.access_token)
      // console.log('response.data是', response.data.data.roles[0].roleName)
      //判断是否有回调参数
      localStorage.setItem('role', response.data.data.roles[0].roleName)
    //   if (redirect)
    // {
    //   console.log('role是', role);

    //   window.location.href = `${redirect}?token=${response.data.data.access_token}&role=${response.data.data.roles[0].roleName}`
    // }
      // }
      router.push('/framework')
    }
    else {
      // console.log(response.data.msg);
      ElMessage.error(response.data.msg)
    }
  } catch (error) {
    loading.value = false
    ElMessage.error('登录失败，请稍后重试')
  }
}
</script>

<style scoped>
input {
  -webkit-box-shadow: 0 0 0 1000px #f5f5f5 inset;
  border: 0;
  outline: none;
}

* {
  padding: 0;
  margin: 0;
  /* 改盒子高度和长度的计算 */
  box-sizing: border-box;
}

img {
  /* 除掉图片底端的空隙 */
  border: 0;
  /* 图片和文字中心对齐 */
  vertical-align: middle;
}

button {
  /* 让鼠标变小手 */
  cursor: pointer;
}

p,
h1,
h2,
h3,
h4,
h5,
span,
form {
  cursor: default;
}

button,
input {
  font-family: 微软雅黑;
}
input[type='text']:focus {
  background-color: #f5f5f5;
}
.clearfix::after {
  visibility: hidden;
  clear: both;
  display: block;
  content: '';
  height: 0;
}

.container {
  width: 100vw;
  height: 100vh;

  display: flex;
  /* 交叉轴：竖直 */
  align-items: center;
  /* 主轴水平 */
  justify-content: center;
}
.container1{
   background: url(./../../../image/pc登录背景.png) no-repeat;
   background-size: cover;
   width: 100vw;
  height: 100vh;
}
.container2{
   background: url(./../../../image/mobile登录背景.png) fixed no-repeat;
   background-size: cover;
   width: 100vw;
  height: 100vh;
}
.container::-webkit-scrollbar {
  display: none !important;
}
.container .pc {
  width: 430px;
  height: 400px;
  backdrop-filter: blur(80px);
  background-color: #fff;
  border-radius: 5px;
}
.container .pc .form_left {
  width: 100%;
  height: 100%;
  float: right;
  margin-top: 30px;
}
.container .pc .form_left h1 {
  font-size: 24px;
  text-align: center;
  letter-spacing: 0.05em;
  padding-bottom: 15px;
}
.container .pc .form_left h3 {
  font-size: 20px;
  text-align: center;
  padding-top: 15px;
  letter-spacing: 0.05em;
}

.container .uname,
.password {
  background-color: #f5f5f5;
  width: 70%;
  height: 12%;
  margin: 6% auto;
  padding: 0;
  border-radius: 5px;
}
.remenber {
  width: 70%;
  height: 2%;
  margin: 0 auto;
}
.el-checkbox.el-checkbox--large {
  height: 24px;
}
.container .pc .form_left .uname input,
.password input {
  width: 80%;
  border: none;
  outline: none;
  background-color: #f5f5f5;
}
input:focus {
  background-color: #f5f5f5 !important;
}
.container .pc .form_left .uname span,
.password span {
  height: 120%;
  width: 40%;
}
.btn {
  margin: auto;
  width: 70%;
  height: 12%;
  margin: 11% 15%;
}
.log {
  width: 100%;
  height: 100%;
  background-color: #003685;
  border-radius: 5px;
  color: #fff;
  letter-spacing: 0.05em;
  outline: none;
  border: none;
  font-size: 16px;
}
.uname div,
.password div {
  display: inline-block;
  width: 15%;
  vertical-align: middle;
  padding: 10px;
}

/* 移动端*/
.mobile{
  background-color: #fff;
  border-radius: 10px;
  width: 250px;
  height: 280px;
}
.mobile h1{
  font-size: 22px;
  text-align: center;
  line-height: 24px;
  padding: 20px 0;
}
.mobile .uname div,.mobile .password div{
  padding: 5px;
}
.mobile .uname input,.mobile .password input {
  margin-left: 10px;
  width: 135px;
}
.mobile .btn{
  margin-top: 35px;
}
</style>
