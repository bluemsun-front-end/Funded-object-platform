<template>
  <NavBar />

  <div class="student-file">
    <SearchBox @search="search" />

    <el-table :data="tableData" class="student-table" @selection-change="handleSelectionChange"
      v-loading="loadings.table">
      <el-table-column type="selection" width="55"></el-table-column>
      <el-table-column prop="studentId" label="学号" minWidth="180"></el-table-column>
      <el-table-column prop="name" label="姓名" minWidth="180"></el-table-column>
      <el-table-column prop="grade" label="年级" minWidth="180"> </el-table-column>
      <el-table-column prop="major" label="专业" minWidth="180">
        <template #default="{ row }">
          {{ formatMajor(row.major) }}
        </template>
      </el-table-column>
      <el-table-column prop="degree" label="学历" minWidth="180">
        <template #default="{ row }">
          {{ formatDegree(row.degree) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleViewDetail(row)">查看详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination background layout="->, sizes, prev, pager, next, jumper, total" v-model:current-page="query.pageNum"
      v-model:page-size="query.pageSize" @size-change="handleSizeChange" @current-change="handleCurrentChange"
      :total="total" class="my-pagination" />

    <el-dialog v-model="visible" :title="`学生信息`" width="1000" :close-on-click-modal="false" :before-close="closeDialog">
      <el-descriptions :column="4" border class="custom-descriptions">
        <el-descriptions-item label="学号">{{ studentRow.studentId }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ studentRow.name }}</el-descriptions-item>
        <el-descriptions-item label="性别">{{
          formatGender(studentRow.gender)
        }}</el-descriptions-item>
        <el-descriptions-item label="学历">{{
          formatDegree(studentRow.degree)
        }}</el-descriptions-item>
        <el-descriptions-item label="学生状态">{{
          formatStatus(studentRow.status)
        }}</el-descriptions-item>
        <el-descriptions-item label="生日">{{
          formatBirthday(studentRow.birthday)
        }}</el-descriptions-item>
        <el-descriptions-item label="年级">{{ studentRow.grade }}</el-descriptions-item>
        <el-descriptions-item label="民族">{{
          formatEthnicity(studentRow.nationality)
        }}</el-descriptions-item>
        <el-descriptions-item label="学院">{{
          formatCollege(studentRow.college)
        }}</el-descriptions-item>
        <el-descriptions-item label="专业">{{
          formatMajor(studentRow.major)
        }}</el-descriptions-item>
        <el-descriptions-item label="入学日期">{{ studentRow.admissionDate }}</el-descriptions-item>
        <el-descriptions-item label="手机号">{{ studentRow.telephone }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ studentRow.email }}</el-descriptions-item>
        <el-descriptions-item label="校区">{{
          formatCampus(studentRow.apartment)
        }}</el-descriptions-item>
        <el-descriptions-item label="公寓">{{ studentRow.dormitory }}</el-descriptions-item>
        <el-descriptions-item label="家庭住址">{{ studentRow.homeAddress }}</el-descriptions-item>
        <el-descriptions-item label="政治面貌">{{
          formatPoliticalStatus(studentRow.political)
        }}</el-descriptions-item>
        <el-descriptions-item label="婚姻状态">{{
          formatMarry(studentRow.marry)
        }}</el-descriptions-item>
        <el-descriptions-item label="资助类型">{{
          formatAssistLevel(studentRow.fundType)
        }}</el-descriptions-item>
      </el-descriptions>
      <el-tabs type="border-card" style="margin-top: 20px">
        <el-tab-pane label="个人处分">
          <el-table :data="paginatedPunishVo" height="350">
            <el-table-column prop="category" label="类别" minWidth="180">
              <template #default="{ row }">
                {{ formatPunishType(+row.category) }}
              </template>
            </el-table-column>
            <el-table-column prop="reason" label="原因" minWidth="180"></el-table-column>
            <el-table-column prop="punishTime" label="处分时间" minWidth="180"></el-table-column>
          </el-table>
          <el-pagination background layout="prev, pager, next" :total="totalNum2" :page-size="6"
            v-model:currentPage="currentPage2" pager-count="50" @current-change="handlePageChange2"
            :disabled="loadingStates.punish" id="pagenation3" class="pagination" />
        </el-tab-pane>
        <el-tab-pane label="个人奖励">
          <el-table :data="paginatedScholarshipVo" height="350">
            <el-table-column prop="category" label="类型" minWidth="180">
              <template #default="{ row }">
                {{ formatFundType(+row.type) }}
              </template>
            </el-table-column>
            <el-table-column prop="grantDate" label="授予日期" minWidth="180"></el-table-column>
            <el-table-column prop="amount" label="金额" minWidth="180"></el-table-column>
          </el-table>
          <el-pagination background layout="prev, pager, next" :total="totalNum3" :page-size="6"
            v-model:currentPage="currentPage3" pager-count="50" @current-change="handlePageChange3"
            :disabled="loadingStates.scholarship" id="pagenation3" class="pagination" />
        </el-tab-pane>
        <el-tab-pane label="社会经历">
          <el-table :data="paginatedProjectVo" height="350">
            <el-table-column prop="startDate" label="开始日期" minWidth="180"></el-table-column>
            <el-table-column prop="endDate" label="结束日期" minWidth="180"></el-table-column>
            <el-table-column prop="experience" label="经历描述" minWidth="180"></el-table-column>
          </el-table>
          <el-pagination background layout="prev, pager, next" :total="totalNum" :page-size="6"
            v-model:currentPage="currentPage" pager-count="50" @current-change="handlePageChange"
            :disabled="loadingStates.project" id="pagenation3" class="pagination" />
        </el-tab-pane>
        <el-button style="display: block; margin: 0px auto; padding: 10px 20px"
          @click="exportStudentInfo()">导出信息</el-button>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import NavBar from './components/NavBar.vue'
import SearchBox from './components/SearchBox.vue'
import { onMounted, ref, provide, computed } from 'vue'
import axios from 'axios'
import request from '@/api/request'
<<<<<<< Updated upstream
import { de } from 'element-plus/es/locale'
import type { ComponentSize } from 'element-plus';
import { ElMessage } from 'element-plus';

=======
>>>>>>> Stashed changes

const userInfo = ref({
  name: 'Kimi',
  age: 30,
})

// 提供数据
provide('userInfo', userInfo)

const tableData = ref([])
const selectedIds = ref([]) // 用来存储选中的学生ID
const handleSelectionChange = (selection) => {
  // 提取选中行的学号（ID）
  selectedIds.value = selection.map((student) => student.userId)
  console.log('选中的学生 ID:', selectedIds.value)
}
provide('selectedIds', selectedIds)

const query = ref({
  pageNum: 1,
  pageSize: 10,
})

const total = ref(0)

const loadings = ref({
  table: false,
})

const search = (params: any) => {
  getList(1, query.value.pageSize, params)
}

const objectToUrlParams = (obj: Record<string, any>): string => {
  return (
    '?' +
    Object.keys(obj)
      .map((key) => {
        if (Array.isArray(obj[key])) {
          return obj[key]
            .map((value) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&')
        } else {
          return `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`
        }
      })
      .join('&')
  )
}

const getList = async (pageNum = 1, pageSize = query.value.pageSize, queryData: any = {}) => {
  try {
    const params = {
      pageNum,
      pageSize,
      ...queryData,
    }
    loadings.value.table = true
    tableData.value = []
    const res = await request.get(
      'http://106.54.24.243:8080/grow/userInfo/listAll' + objectToUrlParams(params),
    )
    if (res.data.rows) {
      const { rows } = res.data
      console.log(rows)
      query.value.pageNum = pageNum
      query.value.pageSize = pageSize
      tableData.value = rows
      total.value = res.data.total
    }
  } catch (err) {
    console.log(err)
  } finally {
    loadings.value.table = false
  }
}
const token = localStorage.getItem('token')
// 导出学生信息
const viewedUserId = ref('') // 创建一个响应式变量来存储查看的学生的userId

const handleViewDetail = async (row: any) => {
  viewedUserId.value = row.userId // 获取点击的学生的userId
  const res = await request.get(
    'http://106.54.24.243:8080/grow/userInfo/detail?userId=' + row.userId,
  )

  studentRow.value = res.data.data.fundUserInfoVo
  fundProjectVo.value = res.data.data.fundProjectVo
  fundScholarshipVo.value = res.data.data.fundScholarshipVo
  fundPunishVo.value = res.data.data.fundPunishVo
  // 更新总记录数
  totalNum.value = fundProjectVo.value.length;
  totalNum2.value = fundPunishVo.value.length;
  totalNum3.value = fundScholarshipVo.value.length;
  // 重置页码
  currentPage.value = 1;
  currentPage2.value = 1;
  currentPage3.value = 1;
  visible.value = true
}

const exportStudentInfo = async () => {
  try {
    const config = {
      headers: {
        Authorization: 'Bear ' + token,
        clientid: localStorage.getItem('client_id'),
        'Content-Type': 'application/json',
      },
    }
    const params = {
      userId: viewedUserId.value, // 使用查看的学生的userId
    }
    const response = await axios.get('http://106.54.24.243:8080/grow/userOwnInfo/exportAll', {
      ...config,
      params,
      responseType: 'blob',
    })

    const blob = new Blob([response.data], { type: 'application/vnd.ms-excel' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'student_info.xlsx' // 可以修改为从响应头中获取的文件名
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出信息时出错:', error)
  }
}
const handleSizeChange = (val: number) => {
  getList(query.value.pageNum, val)
}

const handleCurrentChange = (val: number) => {
  getList(val, query.value.pageSize)
}

onMounted(() => {
  getList()
})

const studentRow = ref({})
// 个人处分
const fundPunishVo = ref([])
// 个人奖励
const fundScholarshipVo = ref([])
// 社会经历
const fundProjectVo = ref([])
const visible = ref(false)

// 分页器相关变量
const currentPage = ref(1); // 当前页码
const totalNum = ref(0); // 总记录数
const currentPage2 = ref(1); // 第二个分页器的当前页码
const totalNum2 = ref(0); // 第二个分页器的总记录数
const currentPage3 = ref(1); // 第三个分页器的当前页码
const totalNum3 = ref(0); // 第三个分页器的总记录数

// 定义分页器的每页显示条数
const pageSize = ref(8);

// 加载状态
const loadingStates = ref({
  project: false,
  punish: false,
  scholarship: false
});

// 修改表格数据为计算属性，实现前端分页
const paginatedProjectVo = computed(() => {
  const start = (currentPage.value - 1) * 6;
  return fundProjectVo.value.slice(start, start + 6);
});

const paginatedPunishVo = computed(() => {
  const start = (currentPage2.value - 1) * 6;
  return fundPunishVo.value.slice(start, start + 6);
});

const paginatedScholarshipVo = computed(() => {
  const start = (currentPage3.value - 1) * 6;
  return fundScholarshipVo.value.slice(start, start + 6);
});

// 定义分页器的页码变化处理函数（带错误处理）
const handlePageChange = async (val: number) => {
  try {
    loadingStates.value.project = true;
    currentPage.value = val;
    // 这里可以添加额外的数据获取逻辑（如果是后端分页）
    console.log('当前页码（社会经历）:', val);
  } catch (error) {
    console.error('页码切换失败:', error);
    ElMessage.error('加载社会经历数据失败');
  } finally {
    loadingStates.value.project = false;
  }
};

const handlePageChange2 = async (val: number) => {
  try {
    loadingStates.value.punish = true;
    currentPage2.value = val;
    // 这里可以添加额外的数据获取逻辑（如果是后端分页）
    console.log('当前页码（个人处分）:', val);
  } catch (error) {
    console.error('页码切换失败:', error);
    ElMessage.error('加载处分数据失败');
  } finally {
    loadingStates.value.punish = false;
  }
};

const handlePageChange3 = async (val: number) => {
  try {
    loadingStates.value.scholarship = true;
    currentPage3.value = val;
    // 这里可以添加额外的数据获取逻辑（如果是后端分页）
    console.log('当前页码（个人奖励）:', val);
  } catch (error) {
    console.error('页码切换失败:', error);
    ElMessage.error('加载奖励数据失败');
  } finally {
    loadingStates.value.scholarship = false;
  }
};

// 生日
const formatBirthday = (birthday: string): string => {
  return birthday.substring(0, 10)
}
// 奖学金类型
const formatFundType = (fundType: number): string => {
  switch (fundType) {
    case 0:
      return '国家奖学金'
    case 1:
      return '国家励志奖学金'
    case 2:
      return '学校励志奖学金'
    case 3:
      return '励志学子'
    case 4:
      return '宝钢奖学金'
    case 5:
      return '小米奖学金'
    case 6:
      return '小米特等奖'
    case 7:
      return '恒兴助学奖学金'
    case 8:
      return '小米助学金'
    case 9:
      return '理想与成才'
    default:
      return '未知'
  }
}
// 处罚类型
const formatPunishType = (punishType: number): string => {
  switch (punishType) {
    case 0:
      return '警告'
    case 1:
      return '严重警告'
    case 2:
      return '记过'
    case 3:
      return '留校察看'
    case 4:
      return '开除学籍'
    default:
      return '未知'
  }
}
// 婚烟状态
const formatMarry = (marry: number): string => {
  switch (marry) {
    case 0:
      return '未婚'
    case 1:
      return '已婚'
    default:
      return '未知'
  }
}
// 资助等级
const formatAssistLevel = (assistLevel: number): string => {
  switch (assistLevel) {
    case 0:
      return '经济关注对象'
    case 1:
      return '特别资助对象'
    case 2:
      return '重点资助对象'
    case 3:
      return '一般资助对象'
    case 4:
      return '公费师范生'
    default:
      return '未知'
  }
}
//专业
const formatMajor = (majorCode: string): string => {
  switch (majorCode) {
    case '51':
      return '图书馆学'
    case '61':
      return '生物技术'
    case '60':
      return '生物科学'
    case '59':
      return '应用化学'
    case '58':
      return '化学'
    case '57':
      return '电气工程及其自动化'
    case '56':
      return '电子信息科学与技术'
    case '55':
      return '材料物理'
    case '54':
      return '物理学'
    case '53':
      return '智能科学与技术'
    case '52':
      return '信息资源管理'
    case '62':
      return '药学'
    case '50':
      return '软件工程'
    case '49':
      return '计算机科学与技术'
    case '48':
      return '教育技术学'
    case '47':
      return '应用统计学'
    case '46':
      return '经济统计学'
    case '45':
      return '数据科学与大数据技术'
    case '44':
      return '统计学'
    case '43':
      return '数学与应用数学'
    case '42':
      return '社会学'
    case '72':
      return '运动训练'
    case '81':
      return '汉语言'
    case '80':
      return '广播电视学'
    case '79':
      return '数字媒体技术'
    case '78':
      return '播音与主持艺术'
    case '77':
      return '广播电视编导'
    case '76':
      return '广告学'
    case '75':
      return '新闻学'
    case '74':
      return '冰雪运动'
    case '73':
      return '武术与民族传统体育'
    case '41':
      return '社会工作'
    case '71':
      return '体育教育'
    case '70':
      return '环境生态工程'
    case '69':
      return '环境工程'
    case '68':
      return '环境科学'
    case '67':
      return '生态学'
    case '66':
      return '自然地理与资源环境'
    case '65':
      return '地理信息科学'
    case '64':
      return '人文地理与城乡规划'
    case '63':
      return '地理科学'
    case '10':
      return '物流管理'
    case '20':
      return '汉语言文学'
    case '19':
      return '工商管理'
    case '18':
      return '财务管理'
    case '17':
      return '人力资源管理'
    case '16':
      return '会计学'
    case '15':
      return '市场营销'
    case '14':
      return '国际经济与贸易'
    case '13':
      return '金融学'
    case '12':
      return '财政学'
    case '11':
      return '经济学'
    case '21':
      return '汉语国际教育'
    case '9':
      return '政治学与行政学'
    case '8':
      return '行政管理'
    case '7':
      return '思想政治教育'
    case '6':
      return '国际政治'
    case '5':
      return '法学'
    case '4':
      return '心理学'
    case '3':
      return '公共事业管理'
    case '2':
      return '小学教育'
    case '1':
      return '学前教育'
    case '31':
      return '舞蹈编导'
    case '40':
      return '哲学'
    case '39':
      return '数字媒体艺术'
    case '38':
      return '表演'
    case '37':
      return '产品设计'
    case '36':
      return '服装与服饰设计'
    case '35':
      return '环境设计'
    case '34':
      return '视觉传达设计'
    case '33':
      return '雕塑'
    case '32':
      return '美术学'
    case '0':
      return '教育学'
    case '30':
      return '音乐学'
    case '29':
      return '德语'
    case '28':
      return '商务英语'
    case '27':
      return '日语'
    case '26':
      return '俄语'
    case '25':
      return '英语'
    case '24':
      return '考古学'
    case '23':
      return '旅游管理'
    case '22':
      return '历史学'
    default:
      return '未知'
  }
}
// 学历
const formatDegree = (degree: string): string => {
  switch (degree) {
    case '0':
      return '本科'
    case '1':
      return '研究生'
    default:
      return '未知'
  }
}
// 学生状态
const formatStatus = (status: string): string => {
  switch (status) {
    case '0':
      return '在校'
    case '1':
      return '肄业'
    case '2':
      return '离校'
    default:
      return '未知'
  }
}
// 校区
const formatCampus = (campus: string): string => {
  switch (campus) {
    case '0':
      return '本部'
    case '1':
      return '净月'
    default:
      return '未知'
  }
}
// 性别
const formatGender = (gender: string): string => {
  switch (gender) {
    case '0':
      return '男'
    case '1':
      return '女'
    default:
      return '未知'
  }
}
// 政治面貌
const formatPoliticalStatus = (status: number): string => {
  switch (status) {
    case 0:
      return '共青团员'
    case 1:
      return '中共党员'
    case 2:
      return '中共预备党员'
    case 3:
      return '民革党员'
    case 4:
      return '民盟盟员'
    case 5:
      return '民建会员'
    case 6:
      return '民进会员'
    case 7:
      return '农工党党员'
    case 8:
      return '致公党党员'
    case 9:
      return '九三学社社员'
    case 10:
      return '台盟盟员'
    case 11:
      return '无党派人士'
    case 12:
      return '群众'
    default:
      return '未知政治面貌'
  }
}
// 学院
const formatCollege = (collegeCode: string): string => {
  switch (collegeCode) {
    case '10':
      return '数学与统计学院'
    case '19':
      return '国际汉学院'
    case '18':
      return '传媒科学学院'
    case '17':
      return '体育学院'
    case '16':
      return '环境学院'
    case '15':
      return '地理科学学院'
    case '14':
      return '生命科学学院'
    case '13':
      return '化学学院'
    case '12':
      return '物理学院'
    case '11':
      return '信息科学与技术学院'
    case '0':
      return '教育学部'
    case '9':
      return '马克思主义学部'
    case '8':
      return '美术学院'
    case '7':
      return '音乐学院'
    case '6':
      return '外国语学院'
    case '5':
      return '历史文化学院'
    case '4':
      return '文学院'
    case '3':
      return '经济与管理学院'
    case '2':
      return '政法学院'
    case '1':
      return '心理学院'
    default:
      return '未知学院'
  }
}
// 民族
const formatEthnicity = (code: string): string => {
  switch (code) {
    case '0':
      return '汉族'
    case '1':
      return '蒙古族'
    case '2':
      return '回族'
    case '3':
      return '藏族'
    case '4':
      return '维吾尔族'
    case '5':
      return '苗族'
    case '6':
      return '彝族'
    case '7':
      return '壮族'
    case '8':
      return '布依族'
    case '9':
      return '朝鲜族'
    case '10':
      return '满族'
    case '11':
      return '侗族'
    case '12':
      return '瑶族'
    case '13':
      return '白族'
    case '14':
      return '土家族'
    case '15':
      return '哈尼族'
    case '16':
      return '哈萨克族'
    case '17':
      return '傣族'
    case '18':
      return '黎族'
    case '19':
      return '傈僳族'
    case '20':
      return '佤族'
    case '21':
      return '畲族'
    case '22':
      return '高山族'
    case '23':
      return '拉祜族'
    case '24':
      return '水族'
    case '25':
      return '东乡族'
    case '26':
      return '纳西族'
    case '27':
      return '景颇族'
    case '28':
      return '柯尔克孜族'
    case '29':
      return '土族'
    case '30':
      return '达斡尔族'
    case '31':
      return '仫佬族'
    case '32':
      return '羌族'
    case '33':
      return '布朗族'
    case '34':
      return '撒拉族'
    case '35':
      return '毛难族'
    case '36':
      return '仡佬族'
    case '37':
      return '锡伯族'
    case '38':
      return '阿昌族'
    case '39':
      return '普米族'
    case '40':
      return '塔吉克族'
    case '41':
      return '怒族'
    case '42':
      return '乌孜别克族'
    case '43':
      return '俄罗斯族'
    case '44':
      return '鄂温克族'
    case '45':
      return '崩龙族'
    case '46':
      return '保安族'
    case '47':
      return '裕固族'
    case '48':
      return '京族'
    case '49':
      return '塔塔尔族'
    case '50':
      return '独龙族'
    case '51':
      return '鄂伦春族'
    case '52':
      return '赫哲族'
    case '53':
      return '门巴族'
    case '54':
      return '珞巴族'
    case '55':
      return '基诺族'
    default:
      return '未知民族'
  }
}
</script>

<style scoped>
.student-file {
  width: 80%;
  min-width: 1000px;
  margin: 0 auto;
}

.student-table {
  width: 100%;
  height: 500px;
  margin-top: 10px;
}

.my-pagination {
  margin-top: 20px;
  text-align: right;
}

.custom-descriptions .el-descriptions__label {
  width: 200px;
}

#pagenation3 {
  bottom: 1.5vh;
  text-align: center;
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}
</style>
