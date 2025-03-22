<template>
  <div class="form-container" v-if="studentInfo">
    <h2>学生信息</h2>
    <div class="form-item">
      <div class="field">
        <label>姓名：</label>
        <span>{{ studentInfo.name || '未知' }}</span>
      </div>
      <div class="field">
        <label>学号：</label>
        <span>{{ studentInfo.studentId || '未知' }}</span>
      </div>
    </div>
    <div class="form-item">
      <div class="field">
        <label>学位：</label>
        <span>{{ studentInfo.degree || '未知' }}</span>
      </div>
      <div class="field">
        <label>年级：</label>
        <span>{{ studentInfo.grade || '未知' }}</span>
      </div>
    </div>
    <div class="form-item">
      <div class="field">
        <label>生日：</label>
        <span>{{ studentInfo.birthday || '未知' }}</span>
      </div>
      <div class="field">
        <label>入学时间：</label>
        <span>{{ studentInfo.admissionDate || '未知' }}</span>
      </div>
    </div>
    <div class="form-item">
      <div class="field">
        <label>学院：</label>
        <span>{{ studentInfo.college || '未知' }}</span>
      </div>
      <div class="field">
        <label>专业：</label>
        <span>{{ studentInfo.major || '未知' }}</span>
      </div>
    </div>
    <div class="form-item">
      <div class="field">
        <label>公寓：</label>
        <span>{{ studentInfo.apartment || '未知' }}</span>
      </div>
      <div class="field">
        <label>宿舍：</label>
        <span>{{ studentInfo.dormitory || '未知' }}</span>
      </div>
    </div>
    <div class="form-item">
      <div class="field">
        <label>民族：</label>
        <span>{{ studentInfo.nationality || '未知' }}</span>
      </div>
      <div class="field">
        <label>家庭住址：</label>
        <span>{{ studentInfo.homeAddress || '未知' }}</span>
      </div>
    </div>
  </div>
  <div v-else class="loading">加载中...</div> <!-- 显示加载中 -->
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { defineEmits } from 'vue'

// 定义父组件传递的事件
const emit = defineEmits(['roleName'])

// 定义响应式数据存储学生信息
const studentInfo = ref(null)
// 默认数据（用于接口未调用时展示）
const defaultStudentInfo = {
  name: '未知',
  studentId: '未知',
  degree: '未知',
  grade: '未知',
  birthday: '未知',
  admissionDate: '未知',
  college: '未知',
  major: '未知',
  nationality: '未知',
  dormitory: '未知',
  apartment: '未知',
  homeAddress: '未知'
}


// 获取Token和ClientID
const token = localStorage.getItem('token')
const clientid = localStorage.getItem('client_id')

// 获取学生信息的函数
const fetchStudentInfo = async () => {
  try {
    const response = await axios.get('http://106.54.24.243:8080/system/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`, // 将Token加入请求头
        clientid: clientid
      }
    })
    studentInfo.value = response.data.data.fundUserInfo
    emit('roleName', response.data.data.roleGroup)
    // 存储字典接口相关的字段
const degreeDictCode = studentInfo.value.degree    // 学位字典编码
const collegeDictCode = studentInfo.value.college   // 学院字典编码
const nationalityDictCode = studentInfo.value.nationality // 民族字典编码
const majorDictCode = studentInfo.value.major    // 专业字典编码
const apartmentDictCode = studentInfo.value.apartment // 公寓字典编码

    
    // 获取字典信息
    fetchDictData(degreeDictCode, 'degree')
    fetchDictData(collegeDictCode, 'college')
    fetchDictData(nationalityDictCode, 'nationality')
    fetchDictData(majorDictCode, 'major')
     fetchDictData(apartmentDictCode, 'apartment')
  } catch (error) {
    console.error('获取学生信息失败:', error)
    studentInfo.value = defaultStudentInfo // 如果接口调用失败，使用默认数据
  }
}

// 获取字典数据的函数
const fetchDictData = async (dictCode, type) => {
  try {
    const response = await axios.get(`http://106.54.24.243:8080/system/dict/data/${dictCode}`, {
      headers: {
        Authorization: `Bearer ${token}`, // 使用存储的 Token
        clientid: clientid
      }
    })
    const dictLabel = response.data.data.dictLabel // 获取字典标签
    if (type === 'degree') {
      studentInfo.value.degree = dictLabel // 设置学位
    } else if (type === 'college') {
      studentInfo.value.college = dictLabel // 设置学院
    } else if (type === 'nationality') {
      studentInfo.value.nationality = dictLabel // 设置民族
    } else if (type === 'major') {
      studentInfo.value.major = dictLabel // 设置专业
    } else if (type === 'apartment') {
      studentInfo.value.apartment = dictLabel // 设置公寓
    }
  } catch (error) {
    console.error(`${type} 字典数据获取失败`, error)
  }
}

// 在组件挂载时调用
onMounted(() => {
  fetchStudentInfo()
})
</script>

<style scoped>
/* 设置表单容器 */
.form-container {
  background-color: #fff; /* 白色背景 */
  color: #333; /* 深色文本 */
  max-width: 900px;
  margin: 0 auto;
  padding: 0px 30px;
}
/* 标题样式 */
h2 {
  text-align: center;
  font-size: 28px;
  margin-bottom: 40px;
  color: #2d4059; /* 标题使用蓝色 */
  font-weight: 600;
}

/* 表单项布局 */
.form-item {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
  padding: 12px;
  border-bottom: 1px solid #e0e0e0; /* 细的分割线 */
}

.form-item:last-child {
  border-bottom: none; /* 最后一项不需要分割线 */
}

.field {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 45%; /* 每个字段占一行的 45%，两项并排 */
  margin-right: 5%; /* 右侧间距 */
}

.field:last-child {
  margin-right: 0; /* 最后一个字段不需要右侧间距 */
}

.field label {
  font-size: 16px;
  font-weight: 500;
  color: #555; /* 深灰色文本 */
  width: 100px; /* 固定宽度 */
  white-space: nowrap; /* 防止换行 */
}

.field span {
  font-size: 16px;
  color: #333; /* 数据值颜色 */
  flex: 1; /* 自适应剩余空间 */
  text-align: left;
  padding-left: 10px; /* 左侧间距 */
}

/* 加载中的提示 */
.loading {
  text-align: center;
  font-size: 18px;
  color: #999;
}

/* 响应式：调整小屏幕下的显示方式 */
@media (max-width: 600px) {
  .form-container {
    padding: 20px;
  }

  .form-item {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 15px;
  }

  .field {
    width: 100%;
    margin-right: 0; /* 移除右侧间距 */
    margin-bottom: 10px; /* 添加底部间距 */
  }

  .field label {
    margin-bottom: 5px;
  }

  .field span {
    width: 100%;
    text-align: left;
  }
}
</style>