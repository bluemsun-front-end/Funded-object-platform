<template>
  <div class="search-box">
    <el-input v-model="searchData.grade" class="search-input" placeholder="年级" clearable />
    <el-input v-model="searchData.name" class="search-input" placeholder="名字" clearable />
    <el-input v-model="searchData.studentId" class="search-input" placeholder="学号" clearable />
    <el-input v-model="searchData.major" class="search-input" placeholder="专业" clearable />
    <el-input v-model="searchData.degree" class="search-input" placeholder="学位" clearable />
    <el-button @click="reset" type="primary">重置</el-button>
    <el-button @click="onSearch" type="primary" style="margin-left: 0px">搜索</el-button>
    <div class="box-right">
      <el-button @click="exportInfo" type="primary" class="export-button">导出信息</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, inject, ref } from 'vue'
import axios from 'axios'
const authToken = localStorage.getItem('token')
const token = `Bearer ${authToken}`
const emit = defineEmits(['search'])
const searchData = reactive({
  grade: '',
  name: '',
  studentId: '',
  major: '',
  degree: '',
})

const reset = () => {
  searchData.grade = ''
  searchData.name = ''
  searchData.studentId = ''
  searchData.major = ''
  searchData.degree = ''
}
const onSearch = () => {
  //请求在这里
  emit('search', searchData)
}
const selectedIds = ref(inject('selectedIds', []))
const exportInfo = async () => {
  try {
    const config = {
      headers: {
        Authorization: token,
        clientid: localStorage.getItem('client_id'),
        'Content-Type': 'application/json',
      },
    }
    const params = {
      userId: selectedIds.value,
    }
    const response = await axios.post(
      'http://59.110.62.188:8080/grow/userOwnInfo/exportOne',
      params,
      {
        ...config,
        responseType: 'blob', // 确保响应类型为 Blob（二进制数据）
      },
    )

    // 创建 Blob 对象
    const blob = response.data
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // 获取文件名，假设从响应头中获取
    const disposition = response.headers['content-disposition']
    let fileName = 'exported_file.xlsx' // 默认文件名
    if (disposition) {
      const fileNameMatch = disposition.match(/filename="(.+)"/)
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1]
      }
    }

    link.download = fileName // 设置下载文件的名字
    link.click() // 触发点击事件下载文件

    // 释放 URL 对象
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出信息时出错:', error)
  }
}
</script>

<style scoped>
.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  background-color: #f0f4f8;
  border-radius: 8px;
}

.search-input {
  width: 150px;
}

.box-right {
  margin-left: auto;
}
</style>
