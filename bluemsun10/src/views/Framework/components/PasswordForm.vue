<template>
  <div class="password-form-container">
    <div class="form-title">修改密码</div>

    <el-form :model="form" :rules="rules" ref="formRef" label-width="120px" class="password-form">
      <el-form-item label="旧密码" prop="oldPassword">
        <template #label>
          <span class="required-label">旧密码</span>
        </template>
        <el-input
          v-model="form.oldPassword"
          :type="passwordTypes.oldPassword"
          placeholder="请输入旧密码"
        >
          <template #append>
            <el-icon @click="togglePasswordType('oldPassword')">
              <View v-if="passwordTypes.oldPassword === 'text'" />
              <Hide v-if="passwordTypes.oldPassword === 'password'" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="新密码" prop="newPassword">
        <template #label>
          <span class="required-label">新密码</span>
        </template>
        <el-input
          v-model="form.newPassword"
          :type="passwordTypes.newPassword"
          placeholder="请输入新密码"
        >
          <template #append>
            <el-icon @click="togglePasswordType('newPassword')">
              <View v-if="passwordTypes.newPassword === 'text'" />
              <Hide v-if="passwordTypes.newPassword === 'password'" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item label="确认新密码" prop="confirmPassword">
        <template #label>
          <span class="required-label">确认新密码</span>
        </template>
        <el-input
          v-model="form.confirmPassword"
          :type="passwordTypes.confirmPassword"
          placeholder="请再次输入新密码"
        >
          <template #append>
            <el-icon @click="togglePasswordType('confirmPassword')">
              <View v-if="passwordTypes.confirmPassword === 'text'" />
              <Hide v-if="passwordTypes.confirmPassword === 'password'" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item class="button-group">
        <el-button type="primary" class="save-button" @click="handleSave">保存</el-button>
        <el-button type="danger" class="close-button" @click="handleClose">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElForm, ElFormItem, ElInput, ElButton, ElIcon, ElMessage } from 'element-plus'
import { View, Hide } from '@element-plus/icons-vue'
import axios from 'axios'
import Axios from 'axios'

// 获取对表单的引用
const formRef = ref(null) // 这里定义 formRef

// 表单数据
const form = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 密码类型状态
const passwordTypes = ref({
  oldPassword: 'password',
  newPassword: 'password',
  confirmPassword: 'password',
})

// 切换密码类型
const togglePasswordType = (passwordType) => {
  passwordTypes.value[passwordType] =
    passwordTypes.value[passwordType] === 'password' ? 'text' : 'password'
}

// 确认新密码验证
const confirmPasswordValidator = (rule, value, callback) => {
  if (value !== form.value.newPassword) {
    callback(new Error('两次输入的新密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const rules = ref({
  oldPassword: [{ required: true, message: '旧密码不能为空', trigger: 'blur' }],
  newPassword: [{ required: true, message: '新密码不能为空', trigger: 'blur' }],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: confirmPasswordValidator, trigger: 'blur' },
  ],
})
// 重置密码
const resetPassword = async (oldPassword, newPassword) => {
  try {
    const token = localStorage.getItem('token');
    const clientid = localStorage.getItem('client_id')
    const response = await axios.put(
      'http://106.54.24.243:8080/system/user/profile/updatePwd',
      JSON.stringify({ 
        oldPassword,
        newPassword,
      }),
      {
        headers: {
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}`,
          clientid:clientid
        },
      },
    );

    if (response.data.code === 200) {
      ElMessage.success('密码重置成功！');
      // 三个密码输入框清空
      form.value.oldPassword = ''
      form.value.newPassword = ''
      form.value.confirmPassword = ''
    } else {
      ElMessage.error(response.data.msg+'!');
    }
  } catch (error) {
    console.error('请求错误', error);
    ElMessage.error('密码重置请求失败');
  }
}

// 保存操作
const handleSave = async () => {
  try {
    await formRef.value.validate() 
    await resetPassword(form.value.oldPassword, form.value.newPassword)
  } catch (error) {
    console.log('表单验证失败')
  }
}

// 关闭操作
const handleClose = () => {
  form.value.oldPassword = ''
  form.value.newPassword = ''
  form.value.confirmPassword = ''
}
</script>

<style scoped>
.password-form-container {
  width: 500px;
  padding: 30px;
  margin: 0px auto;
}

.form-title {
  font-size: 28px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30px;
  color: #2d4059;
}

.password-form {
  background-color: transparent;
  padding: 20px 30px;
}

.el-form-item {
  margin-bottom: 25px;
}

.el-input {
  width: 100%;
  height: 45px;
  font-size: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-input:focus {
  box-shadow: 0 0 5px 2px rgba(72, 128, 239, 0.5);
  border-color: #409eff;
}

.el-button {
  width: 30%;
  height: 40px;
  font-size: 16px;
  font-weight: 700;
  border-radius: 8px;
  margin-right: 4%;
}

.el-button--primary {
  background-color: #5ab2ecf7;
  border: none;
  color: white;
}

.el-button--danger {
  background-color: #e23e57;
  border: none;
  color: white;
}

.el-button:hover {
  opacity: 0.9;
}

.el-button:active {
  opacity: 0.8;
}

.el-form-item .el-input__inner {
  border-radius: 8px;
  font-size: 14px;
}

.el-form-item.is-error .el-input__inner {
  border-color: #f56c6c;
}

.el-form-item label {
  font-weight: 500;
}

.button-group {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

:deep(.el-icon) {
  cursor: pointer;
  font-size: 20px;
}
</style>