<template>
  <div class="header">
    <h1 class="title">个人成长档案</h1>
    <button class="exit-btn" @click="goToFramework">返回</button>

  </div>
</template>

<script setup>
import Axios from '@/views/Axios'
import { ref } from 'vue';
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
const router = useRouter()
const goToFramework = () => {
  router.push('/framework')
}
const handleLogout = async () => {
  try {
    const response = await Axios.post('http://59.110.62.188:8080/auth/logout', {
    })
    if (response.data.code === 200) {
      ElMessage.success('退出成功！')

      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('client_id')
      // 等待2秒跳转到登录
      setTimeout(() => {
        // window.location.href = `http://localhost:5173`
        router.push('/')
      }, 60)
    } else {
      ElMessage.error(response.data.msg + '!')
    }
    // eslint-disable-next-line no-unused-vars
  } catch (error) {
    ElMessage.error('请求失败！')
  }
}


</script>
<style scoped>
.header {
  background-color: rgba(255, 255, 255, 0.39);
  color: #007bff;
  text-align: center;
  padding: 20px 0;
  font-size: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  position: relative;
  width: 100%;
  line-height: 60px;
}

.title {
  margin: 0;
}

.exit-btn {
  position: absolute;
  top: 55%;
  right: 50px;
  transform: translateY(-50%);
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 8px 16px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition:
    background-color 0.3s ease,
    transform 0.2s ease;
}

.exit-btn:hover {
  background-color: #c0392b;
}

.exit-btn:active {
  background-color: #a93226;
}
</style>