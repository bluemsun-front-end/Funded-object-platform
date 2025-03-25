<template>
  <div class="tab-container">
    <el-tabs v-model="activeTab" class="custom-tabs" type="card">
      <el-tab-pane v-if="role === '资助对象'" label="基本信息" name="tab1">
        <div class="tab-content">
          <information-form></information-form>
        </div>
      </el-tab-pane>
      
      <el-tab-pane label="修改密码" name="tab2">
        <div class="tab-content">
          <password-form></password-form>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import InformationForm from './InformationForm.vue'
import PasswordForm from './PasswordForm.vue'

// const props = defineProps({
//   message: String
// })
// const role = ref(props.message)
const role = localStorage.getItem('role')
const activeTab = ref(role === '资助对象' ? 'tab1' : 'tab2')
// watch(() => props.message, (newMessage) => {
//   role.value = newMessage
//   activeTab.value = role.value === '资助对象' ? 'tab1' : 'tab2'
// })
</script>

<style scoped>
/* Tab 整体容器 */
.tab-container {
  max-width: 744px;
  margin: 0 20px;
  padding: 20px;
  background-color: white;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

/* 自定义 Tab 栏样式 */
:deep(.custom-tabs .el-tabs__header) {
  padding: 6px;
  padding-bottom: 0px;
}

:deep(.custom-tabs .el-tabs__item) {
  font-weight: bold;
  color: #000;
  padding: 12px 20px;
  background-color: transparent;
  transition: all 0.3s ease;
}

:deep(.custom-tabs .el-tabs__item:hover) {
  background-color: rgba(0, 123, 255, 0.1);
  cursor: pointer;
}

:deep(.custom-tabs .el-tabs__item.is-active) {
  background-color: #5ab2ecf7;
  color: #fff;
}

:deep(.custom-tabs .el-tabs__nav) {
  border-bottom: none;
}

/* Tab 内容区样式 */
.tab-content {
  border-radius: 10px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
  margin-top: 15px;
  height: 480px;
  width: 744px;
}
</style>
