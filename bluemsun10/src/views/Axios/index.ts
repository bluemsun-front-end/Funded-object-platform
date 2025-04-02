import axios from 'axios';

// 创建一个 axios 实例
const instance = axios.create({

  timeout: 10000  // 设置超时时间
});
// 判断移动端还是pc端
import { ref, onMounted } from 'vue'; // 假设你在使用Vue 3 Composition API

// 定义一个响应式变量来存储客户端ID
const clientId = ref<string>('');

// 定义一个变量来判断是电脑端还是移动端
let isPc: boolean = true;

// 定义一个函数来判断是否是电脑端
const isPC = (): void => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile = /mobile|android|iphone|ipad|phone/i.test(userAgent);
  isPc = !isMobile;
  
  // 添加调试日志
  console.log('Current UserAgent:', userAgent);
  console.log('Is Mobile Device:', isMobile);
  console.log('Selected ClientId:', isMobile ? "428a8310cd442757ae699df5d894f051" : "e5cd7e4891bf95d1d19206ce24a7b32e");
};

// 在组件挂载时调用isPC函数，并添加resize事件监听
onMounted(() => {
  isPC();
  window.addEventListener('resize', isPC);  // 在窗口大小改变时重新检测
});


// 请求拦截器：在请求发送之前附加 Authorization 头
instance.interceptors.request.use(
  config => {
    // 每次请求前重新判断设备类型
    isPC();
    
    // 根据设备类型设置clientId
    if (!isPc) {
      clientId.value = "428a8310cd442757ae699df5d894f051"  // 移动端clientId
    } else {
      clientId.value = "e5cd7e4891bf95d1d19206ce24a7b32e"  // PC端clientId
    }

    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['Content-Type'] = 'application/json';
      config.headers["clientid"] = clientId.value;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理响应数据或错误
instance.interceptors.response.use(
  response => response,
  error => {
    // 处理错误
    if (error.response && error.response.status === 401) {
      // 如果 token 过期或无效，可以在这里处理，例如跳转到登录页
            
    }
    return Promise.reject(error);
  }
);

export default instance;