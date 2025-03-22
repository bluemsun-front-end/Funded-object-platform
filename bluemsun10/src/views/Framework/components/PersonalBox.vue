
<template>
  <div class="profile-container">
    <div class="profile-box">
      <!-- 头像 -->
      <div class="avatar">
        <el-row justify="center" align="middle">
          <el-col :span="24">
            <div class="avatar-wrapper" @mouseenter="isHover = true" @mouseleave="isHover = false" @click="triggerFileInput">
              <el-avatar 
                :size="120" 
                :src="circleUrl" 
                class="avatar-image"
              />
              <!-- Hover text -->
              <div v-if="isHover" class="avatar-overlay">
                <div class="overlay-text">上传头像</div>
              </div>
              <input 
                type="file" 
                ref="fileInput" 
                class="file-input" 
                @change="handleFileChange"
                accept="image/*"
              />
            </div>
          </el-col>
        </el-row>
      </div>

      <!-- 个人信息 -->
      <div class="info">
        <h2 class="name">{{ name }}</h2>
        <div class="info-item">
          <i class="iconfont icon-studentId "></i>
          <span><strong>学号:</strong> {{ studentId }}</span>
        </div>
        <!-- <div class="info-item">
          <i class="iconfont icon-sex"></i>
          <span><strong>性别:</strong> {{ sex }}</span>
        </div> -->
        <div class="info-item">
          <i class="iconfont icon-deptName"></i>
          <span><strong>校区:</strong> {{ deptName }}</span>
        </div>
        <div class="info-item">
          <i class="iconfont icon-role"></i>
          <span><strong>角色:</strong> {{ role }}</span>
        </div>
        <!-- <div class="info-item">
          <i class="iconfont icon-phonenumber"></i>
          <span><strong>手机号:</strong> {{ phonenumber }}</span>
        </div>
        <div class="info-item">
          <i class="iconfont icon-email"></i>
          <span><strong>邮箱:</strong> {{ email }}</span>
        </div> -->
      </div>
    </div>
  </div>
</template>




<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { onMounted } from 'vue'
import { reactive, toRefs } from 'vue'
import { ElMessage } from 'element-plus'
// import { defineEmits } from 'vue'
// const emit = defineEmits(['role'])


const state = reactive({
  circleUrl: 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png',
  isHover: false
})

const { circleUrl,isHover } = toRefs(state)
// 定义数据绑定的变量
const name = ref('')
const studentId = ref('')
//const sex = ref('')
const deptName = ref('')
const role = ref('')
// const phonenumber = ref('')
// const email = ref('')

// token（根据需要获取动态设置或传入）
const token = localStorage.getItem('token')
const clientid = localStorage.getItem('client_id')
// 请求接口获取个人信息
const fetchUserInfo = async () => {
  try {
    const response = await axios.get(`http://106.54.24.243:8080/system/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`, // 将Token加入请求头
        clientid:clientid
      },
    })

    const data = {}
    console.log(response.data.data.user);
    
    data.value = response.data.data.user
    // 赋值到模板中的变量
    circleUrl.value = data.value.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'
    name.value = data.value.nickName || '未知'
    studentId.value = data.value.userName || '未知'
    // sex.value = data.value.sex || '未知'
    deptName.value = data.value.deptName || '未知'
    role.value = data.value.roles[0].roleName || '未知'
    // phonenumber.value = data.value.phonenumber || '未知'
    // email.value = data.value.email || '未知'
    // 把role传递给父组件
    // console.log(data.value.roles[0].roleName);
    // emit('role', data.value.roles[0].roleName||'未知')

  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

// 组件挂载时请求数据
onMounted(() => {
  fetchUserInfo() // 这里的 1 是请求的资助对象的 ID
})


// 上传头像
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image')) {
    const reader = new FileReader()
    reader.onload = () => {
      circleUrl.value = reader.result
    }
    reader.readAsDataURL(file)
    uploadAvatar(file)
  }
}

// 调用接口上传头像
const uploadAvatar = async (file) => {
  const formData = new FormData()
  formData.append('avatarfile', file)

  try {
    const response = await axios.post('http://106.54.24.243:8080/system/user/profile/avatar', formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        clientid:clientid,
      },
    })
    if (response.data.code === 200) {
      ElMessage.success('头像上传成功！');
    } else {
      ElMessage.error(response.data.msg+'!');
    }
  } catch (error) {
    ElMessage.error('头像上传请求失败！');
  }
}

const triggerFileInput = () => {
  const fileInput = document.querySelector('input[type="file"]')
  fileInput.click()
}
</script>

<style scoped>

/* 头像外部包裹容器 */
.avatar-wrapper {
  position: relative;
  display: inline-block;
  cursor: pointer;
}

/* 头像的样式 */
.avatar-image {
  transition: opacity 0.3s ease;
  border-radius: 50%;
}

/* Hover效果：头像透明度 */
.avatar-wrapper:hover .avatar-image {
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

/* 显示“上传头像”文本的层 */
.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 4px;
  background-color: rgba(0, 0, 0, 0.2);
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border-radius: 50%;
  padding: 10px;
  transition: opacity 0.3s ease;
}

/* 隐藏文件输入框 */
.file-input {
  display: none;
}

/* 结束 */

/* 背景渐变 */
.profile-container {
  margin-top: 20px;
}

/* 个人信息盒子 */
.profile-box {
  width: 300px;
  padding: 30px;
  border-radius: 20px;
  background-color: #fff;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  overflow: hidden;
  transform: translateY(-20px);
  transition: all 0.3s ease-in-out;
}

.profile-box:hover {
  transform: translateY(-10px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);

}

/* 头像 */
.avatar {
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.demo-basic {
  text-align: center;
}
.demo-basic .sub-title {
  margin-bottom: 10px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}
.demo-basic .demo-basic--circle,
.demo-basic .demo-basic--square {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.demo-basic .block:not(:last-child) {
  border-right: 1px solid var(--el-border-color);
}
.demo-basic .block {
  flex: 1;
}
.demo-basic .el-col:not(:last-child) {
  border-right: 1px solid var(--el-border-color);
}
/* 个人信息区域 */
.info {
  margin-top: 15px;
  color: #333;
}

/* 姓名样式 */
.name {
  font-size: 24px;
  font-weight: bold;
  color: #2d4059;
  margin-bottom: 20px;
}

/* 信息项 */
.info-item {
  display: flex;
  align-items: center;
  justify-content: start;
  margin-bottom: 15px;
  font-size: 16px;
  color: #555;
}

.info-item i {
  font-size: 20px;
  margin-right: 10px;
  color: #3f72af;
}

strong {
  color: #333;
  font-weight: bold;
}

/* Iconfont 样式 */
.icon-studentId::before {
  content: '\e67e';
}
.icon-sex::before {
  content: '\e7f8';
}
.icon-deptName::before {
  content: '\e76c';
}
.icon-role::before {
  content: '\e689';
}
.icon-phonenumber::before {
  content: '\e840';
}
.icon-email::before {
  content: '\e605';
}
</style>
