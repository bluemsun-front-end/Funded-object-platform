<template>
  <el-header height="85px" >
    <div class="header-content">
  <div class="top_hello">
      <span class="hello" style="font-family:隶书 ;font-weight: 700; color:#409eff ;white-space: nowrap;"> 爱心超市 </span>
      <span class="campus" style="font-family: 黑体;white-space: nowrap;">{{ campusName }}</span>
  </div>
  <div class="header_menu">
      <span class="cloud"></span>
      <ul class="menuList" style="font-family: 黑体;">
          <li :class="{ active: activeIndex === 0 }" @click="navigateToIndex(0)" class="" style="white-space: nowrap;"><span class="iconfont icon-shouye"></span> 首页</li>
          <li :class="{ active: activeIndex === 1 }" @click="navigateToIndex(1)" style="white-space: nowrap;"><span class="iconfont icon-icon-test1"></span> 购物车</li>
          <li :class="{ active: activeIndex === 2 }" @click="navigateToIndex(2)" style="white-space: nowrap;"><span class="iconfont icon-icon-test"></span> 订单</li>
      </ul>
  </div>
  <div class="money" style="font-family: 黑体;white-space: nowrap;">
      <span>日用币：{{ generalBalance }}</span>
      <span>服饰币：{{ clothingBalance }}</span>
  </div>
  <el-button type="primary" size="large" style="font-family: 黑体;font-weight: 700;"  @click="centerDialogVisible = true">退出登录</el-button>
  <el-row class="demo-avatar demo-basic">
    <el-col :span="12">
      <div class="demo-basic--circle">
        <div class="block" >
          <el-avatar :size="65" :src="avatarUrl" style="height: 10vh;width: 10vh;" />
        </div>
      </div>
    </el-col>
  </el-row>
  <el-dialog v-model="centerDialogVisible" title="确认退出吗？" width="370" center align-center>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="centerDialogVisible = false" style="margin-left:15px;padding:19px;font-size:16px">取消</el-button>
        <el-button type="primary" @click="handleLogout()" style="padding:19px;font-size:16px;margin-left:20px;">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</div>
  </el-header>
</template>



<script lang="ts" setup>
import { ref, reactive, toRefs, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNavBarData } from '@/stores/useNavBarData';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import Axios from '@/views/Axios'

const router = useRouter();
const authToken = localStorage.getItem('token');
const token = `${authToken}`;
const activeIndex = ref(0);
const centerDialogVisible = ref(false)
const role = localStorage.getItem('role')
const handleLogout = async () => {
  console.log('退出登录')
  try {
    const response = await Axios.post('http://106.54.24.243:8080/auth/logout', {
     
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
  } catch (error) {
    ElMessage.error('请求失败！')
  }
}


// 使用自定义 Hook 获取数据
const { generalBalance, clothingBalance, campusName ,avatarUrl} = useNavBarData(token);

// 初始化第一个菜单项为激活状态
onMounted(() => {
  const pathToIndexMap: Record<string, number> = {
    '/home': 0,
    '/cart': 1,
    '/orderList': 2,
  };
  
  // 修复路径判断：使用 router.currentRoute.value.path
  const currentPath = router.currentRoute.value.path;
  activeIndex.value = pathToIndexMap[currentPath] ?? 0;
});

const navigateToIndex = (index: number) => {
  activeIndex.value = index; // 更新激活项
  // 根据索引跳转到相应的路由
  const path = ['home', 'cart', 'orderList'][index];
  router.push(`/${path}`);
};

</script>
<style scoped>
  /* 弹框修改*/
  ::v-deep .el-dialog__title{ 
  margin-left: 55px !important;
}
.header-content {
  width: 100%; /* 确保父元素宽度为100% */
  display: flex;
  justify-content: space-between; 
  align-items: center;
  height: 85px; 
  margin-left: auto;
  margin-right: auto;
  border-bottom: 1px solid rgb(243.9, 244.2, 244.8);
  box-shadow: 2px 4px 5px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  overflow: hidden;
}

.top_hello, .money {
  font-size: 2vh!important;
}

.top_hello span {
  margin-right: 1.5vw;
  letter-spacing: 0.1em;
  margin: 0 1vw;
}

.campus {
  margin-right: 1vw;
  font-size: 2vh;
}

.hello{
  font-size: 5vh;
}

.money span {
  margin: 0 1vw;
}

.menuList {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.menuList li {
  cursor: pointer;
  height: 85px;
  line-height: 85px;
  font-size: 2.5vh!important;
  display: inline-block;
  padding: 0 3vw;
  text-decoration: none;
  transition: background-color 0.3s, color 0.3s, border-bottom-color 0.3s;
  margin: 0 0.5vw;
}

.menuList li.active {
  color: black;
  border-bottom: 4px solid #409EFF; /* 激活项的样式 */
}

.menuList li:hover:not(.active) {
  border-bottom: 4px solid #409EFF; /* 鼠标悬停时的样式 */
}

.demo-avatar {
  margin-right: 2vh;
}

.top_hello, .money, .menuList li, el-button {
  font-size: 1.5vw; /* 使用视口单位 */
  white-space: nowrap; /* 防止换行 */
  overflow: hidden; /* 隐藏溢出的内容 */
}
</style>