<template>
  <el-header height="85px">
    <div class="header-content">
      <div class="top_hello">
        <span class="hello" style="font-size: 40px;"> 爱心超市 </span>
        <span class="campus">* {{ campusName }}</span>
      </div>
      <div class="header_menu">
        <span class="cloud"></span>

        <div class="menuList" :class="{ 'mobile-menu': isMobile }" v-show="isMenuVisible">
          <span class="hello"> 爱心超市 </span>
          <div class="divider"></div>
          <li :class="{ active: activeIndex === 0 }" @click="navigateToIndex(0)"><span
              class="iconfont icon-shouye"></span> 首页</li>
          <li :class="{ active: activeIndex === 1 }" @click="navigateToIndex(1)"><span
              class="iconfont icon-icon-test1"></span> 购物车</li>
          <li :class="{ active: activeIndex === 2 }" @click="navigateToIndex(2)"><span
              class="iconfont icon-icon-test"></span> 订单</li>
        </div>
      </div>
      <div class="money">
        <span>日用币：{{ generalBalance }}</span>
        <span>服饰币：{{ clothingBalance }}</span>
      </div>
      <div class="right">
        <el-button class="logout" type="primary" size="large" @click="centerDialogVisible = true">退出登录</el-button>
        <button class="iconfont icon-menu" @click="toggleMenu"></button>
      </div>
      
    </div>
    <el-dialog v-model="centerDialogVisible" title="确认退出吗？" width="370" center align-center>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="centerDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleLogout()">
              确认
            </el-button>
          </div>
        </template>
      </el-dialog>
  </el-header>
</template>

<script lang="ts" setup>
import { ref, reactive, toRefs, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useNavBarData } from '@/stores/useNavBarData';
import { ElMessage } from 'element-plus';
import axios from 'axios';
import Axios from '@/views/Axios';

const router = useRouter();
const authToken = localStorage.getItem('token');
const token = `${authToken}`;
const activeIndex = ref(0);
const centerDialogVisible = ref(false);
const role = localStorage.getItem('role');

// 定义 isMobile 和 isMenuVisible
const isMenuVisible = ref(true);
const isMobile = ref(false);

// 检测是否是移动端
const checkIfMobile = () => {
  isMobile.value = window.innerWidth <= 800;
};

onMounted(() => {
  checkIfMobile();
  window.addEventListener('resize', checkIfMobile);
  onMounted(() => {
  if (!localStorage.getItem('token')) {
    window.location.href = 'http://localhost:5173/'
}
});
});

const toggleMenu = () => {
  isMenuVisible.value = !isMenuVisible.value;
};

const handleLogout = async () => {
  //退出登录
  try {
    const response = await Axios.post('http://106.54.24.243:8080/auth/logout', {});
    if (response.data.code === 200) {
      ElMessage.success('退出成功！');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('client_id');
      setTimeout(() => {
        router.push('/');
      }, 60);
    } else {
      ElMessage.error(response.data.msg + '!');
    }
  } catch (error) {
    ElMessage.error('请求失败！');
  }
};

// 使用自定义 Hook 获取数据
const { generalBalance, clothingBalance, campusName, avatarUrl } = useNavBarData(token);

// 初始化第一个菜单项为激活状态
onMounted(() => {
  const pathToIndexMap: Record<string, number> = {
    '/home': 0,
    '/cart': 1,
    '/orderList': 2,
  };

  const currentPath = router.currentRoute.value.path;
  activeIndex.value = pathToIndexMap[currentPath] ?? 0;
});

const navigateToIndex = (index: number) => {
  activeIndex.value = index; // 更新激活项
  const path = ['home', 'cart', 'orderList'][index];
  router.push(`/${path}`);
};
</script>

<style scoped>
/* 样式部分保持不变 */
</style>

<style scoped>
/* 弹框修改*/
::v-deep .el-dialog__title {
  margin-left: 55px !important;
}

.header-content {

  width: 100%;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  backdrop-filter: blur(10px);
  height: 100px;
  z-index: 1000;
}

.hello {
  color: #409EFF;
  font-family: 黑体;
  font-weight: 700;
}


.menuList .hello {
  display: none;
  line-height: 85px;
  
}
.campus{
  font-size: 20px;
  font-family: 黑体;
}

.money span {
  font-size: 15px;
  padding: 10px;
  line-height: 85px;
}

.menuList {
  list-style-type: none;
  display: flex;
  text-align: center;
}

.menuList li {
  font-size: 15px;
  padding: 0 50px;
  display: inline-block;
}

.right {
  display: flex;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
}



.icon-menu{
  border: none;
  font-size: 30px;
}

@media(max-width: 800px) {
  .header-content {
    position: relative;
    /* 或 absolute, fixed */
    z-index: 10;
  }

  .menuList {
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    background-color: #409EFF;
    height: 800vh;
    width: 50%;
    list-style-type: none;
    padding: 0px 10px;
    gap: 16px;
  }
  .menuList.mobile-menu {
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    background-color: #409EFF;
    line-height: 90px;
    width: 50%;
    padding: 0px 5px;
    gap: 16px;
    z-index: 100;
  }

  .menuList li {
    display: inline-block;
    color: white;
    box-sizing: border-box;
  }

  .menuList .hello {
    margin-left: 16px;
    margin-top: 20px;
    font-size: 30px;
    display: block;
  }

  .divider {
    background: rgba(255, 255, 255, 0.1);
    width: 100%;
    height: 2px;
    margin: 10px 0px;

  }

  .top_hello {
    display: none;
  }

  .hello {
    color: white;
  }

  .money {
    display: none;
  }

  .right {
    display: flex;
    align-items: center;
  }

  .right .icon-menu {
    cursor: pointer;
     display: block;
  }

}

@font-face {
  font-family: ChillLongCangKaiShu_Bold;
  src: url(../../../font/ChillLongCangKaiShu_Bold.otf);
}

@media(max-width: 1250px){
  .top_hello .hello {
    display: none;
  }

 .campus {
    display: none;
  
 }
 .money{
  display: none;
 }
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
  text-decoration: none;
  transition: background-color 0.3s, color 0.3s, border-bottom-color 0.3s;
}

.menuList li.active {
  border-bottom: 4px solid #9ec8f3;
  /* 激活项的样式 */
}

.menuList li:hover:not(.active) {
  border-bottom: 4px solid #9ec8f3;
  /* 鼠标悬停时的样式 */
}




.top_hello,
.money,
.menuList li,
el-button {
  /* 使用视口单位 */
  white-space: nowrap;
  /* 防止换行 */
  overflow: hidden;
  /* 隐藏溢出的内容 */
}
</style>