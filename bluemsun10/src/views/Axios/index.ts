

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
  const userAgent = navigator.userAgent

  // 定义一些常见的移动设备和浏览器的用户代理特征
  const mobileAgents: RegExp[] = [
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
};

// 在组件挂载时调用isPC函数
onMounted(() => {
  isPC();
});


// 请求拦截器：在请求发送之前附加 Authorization 头
instance.interceptors.request.use(
  config => {
    if (isPc === false) {
      clientId.value = "428a8310cd442757ae699df5d894f051"
    } else {
      clientId.value = "e5cd7e4891bf95d1d19206ce24a7b32e"
    }
    const token = localStorage.getItem('token'); // 获取 token
    if (token) {
      // 如果存在 token，则将 token 添加到 Authorization 头中
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['Content-Type'] = 'application/json';
      config.headers["clientid"] = clientId.value
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