<template>
  <div class="app-container">
    <div class="filter-container">

      <el-input v-model="listQuery.name" placeholder="游戏名" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>

      <el-select v-model="listQuery.env" placeholder="环境" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in envOptions" :key="item" :label="item" :value="item"/>
      </el-select>

      <el-select v-model="listQuery.game_type" placeholder="类型" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
      </el-select>

      <el-select v-model="listQuery.status" placeholder="状态" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
      </el-select>

      <el-select v-model="listQuery.ordering" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key"/>
      </el-select>

      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('table.add') }}</el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">{{ $t('table.export') }}</el-button>

      <el-checkbox v-model="showChannel" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">渠道</el-checkbox>
    </div>

    <el-table
      v-loading="listLoading"
      :key="tableKey"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
      @sort-change="sortChange">

      <el-table-column label="序号" prop="id" sortable="custom" align="center" width="65">
        <template slot-scope="scope">
          <span>{{ scope.row.id }}</span>
        </template>
      </el-table-column>

      <!--<el-table-column :label="$t('table.date')" width="150px" align="center">-->
      <!--<template slot-scope="scope">-->
      <!--<span>{{ scope.row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>-->
      <!--</template>-->
      <!--</el-table-column>-->

      <el-table-column label="游戏名称" min-width="50px" align="center">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.name }}</span>
          <el-tag>{{ scope.row.game_type | typeFilter }}</el-tag>
        </template>
      </el-table-column>

      // 游戏ID
      <el-table-column label="gameId" width="110px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.game_num }}</span>
        </template>
      </el-table-column>

      <el-table-column label="环境" width="80px">
        <template slot-scope="scope">
          <span>{{ scope.row.env }}</span>
        </template>
      </el-table-column>

      <el-table-column v-if="showChannel" label="渠道数" align="center" width="95">
        <template slot-scope="scope">
          <span v-if="scope.row.channelCount" class="link-type" @click="handleFetchPv(scope.row.id)">{{ scope.row.channelCount }}</span>
          <span v-else>0</span>
        </template>
      </el-table-column>

      <el-table-column label="当前状态" class-name="status-col" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status | statusFilter">{{ scope.row.status | statusFilter }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="$t('table.actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
          <el-button v-if="scope.row.status!='published'" size="mini" type="success" @click="handleModifyStatus(scope.row, 4)">{{ $t('table.publish') }}
          </el-button>
          <!--<el-button v-if="scope.row.status!='draft'" size="mini" @click="handleModifyStatus(scope.row,'draft')" plain disabled>{{ $t('table.draft') }}-->
          <!--</el-button>-->
          <el-button v-if="scope.row.status!='deleted'" size="mini" type="danger" @click="deleteGameInfo(scope.row.id)">{{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">

        <el-form-item label="游戏类型" prop="game_type">
          <el-select v-model="temp.game_type" class="filter-item" placeholder="Please select">
            <el-option v-for="item in calendarTypeOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
          </el-select>
        </el-form-item>

        <el-form-item label="游戏名" prop="name">
          <el-input v-model="temp.name"/>
        </el-form-item>

        <el-form-item label="游戏ID" prop="gameId">
          <el-input v-model="temp.game_num"/>
        </el-form-item>

        <el-form-item label="状态">
          <el-select v-model="temp.status" class="filter-item" placeholder="Please select">
            <el-option v-for="item in statusOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
          </el-select>
        </el-form-item>

        <el-form-item label="环境">
          <el-select v-model="temp.env" class="filter-item" placeholder="Please select">
            <el-option v-for="item in envOptions" :key="item" :label="item" :value="item"/>
          </el-select>
        </el-form-item>

        <!--<el-form-item :label="$t('table.importance')">-->
        <!--<el-rate v-model="temp.importance" :colors="['#99A9BF', '#F7BA2A', '#FF9900']" :max="3" style="margin-top:8px;"/>-->
        <!--</el-form-item>-->

        <el-form-item label="描述">
          <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="temp.memo" type="textarea" placeholder="Please input"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>

    <el-dialog :visible.sync="dialogPvVisible" title="渠道列表" style="text-align: center">
      <el-table :data="pvData" border fit highlight-current-row style="width: 100%">
        <el-table-column prop="key" label="渠道"/>
        <el-table-column prop="pv" label="描述"/>
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="dialogPvVisible = false">{{ $t('table.confirm') }}</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
import { GameInfoList, fetchPv, createArticle, updateArticle } from '@/api/article'
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { gameInfoList, deleteGame, createGame, updateGame } from '@/api/article'
import axios from 'axios'

const calendarTypeOptions = [
  { key: '0', display_name: '人人游戏' },
  { key: '1', display_name: '人机游戏' },
  { key: '2', display_name: 'RPG游戏' },
  { key: '3', display_name: '平台游戏' },
  { key: '4', display_name: '房卡游戏' }
]

// arr to obj ,such as { CN : "China", US : "USA" }
const calendarTypeKeyValue = calendarTypeOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

const statusOptions = [
  { key: 0, display_name: 'prd' },
  { key: 1, display_name: 'dev' },
  { key: 2, display_name: 'test' },
  { key: 3, display_name: 'pre' },
  { key: 4, display_name: 'published' }
]

// arr to obj ,such as { CN : "China", US : "USA" }
const gameStatusKeyValue = statusOptions.reduce((acc, cur) => {
  acc[cur.key] = cur.display_name
  return acc
}, {})

export default {
  name: 'GameList',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      return gameStatusKeyValue[status]
    },
    typeFilter(type) {
      return calendarTypeKeyValue[type]
    }
  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        env: undefined,
        name: undefined,
        game_type: undefined,
        ordering: 'id',
        status: undefined
      },
      importanceOptions: [1, 2, 3],
      calendarTypeOptions,
      sortOptions: [{ label: '升序', key: '+id' }, { label: '降序', key: '-id' }],
      // statusOptions: [
      //   {label: '需求评审', key: '0'},{label: '开发中', key: '1'},{label: '测试中', key: '2'},{label: '预发', key: '3'},{label: '生产', key: '4'},
      // ],
      statusOptions,
      envOptions: ['dev', 'test', 'prd'],
      showChannel: false,
      temp: {
        id: undefined,
        memo: undefined,
        name: '',
        game_type: '',
        status: undefined,
        env: 'TEST',
        game_num: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
      dialogPvVisible: false,
      pvData: [],
      rules: {
        type: [{ required: true, message: 'type is required', trigger: 'change' }],
        timestamp: [{ type: 'date', required: true, message: 'timestamp is required', trigger: 'change' }],
        title: [{ required: true, message: 'title is required', trigger: 'blur' }]
      },
      downloadLoading: false
    }
  },
  created() {
    this.getList()
    console.log(this.list)
  },
  methods: {

    getList(params) {
      this.listLoading = true
      axios.get('http://127.0.0.1:8000/auto/game/', { params }).then(response => {
        console.log(response)
        const items = response.data.results
        this.list = items.map(v => {
          this.$set(v, 'edit', false) // https://vuejs.org/v2/guide/reactivity.html
          v.name = v.name //  will be used when user click the cancel botton
          console.log(v)
          return v
        })
        this.listLoading = false
      }).catch(error => console.log(error))
    },
    deleteGameInfo(id) {
      this.listLoading = true
      deleteGame(id).then(response => {
        console.log('first')
        this.listLoading = false
        this.getList(this.listQuery)
        this.$message({
          message: '操作成功',
          type: 'success'
        })
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      console.log('filter')
      this.getList(this.listQuery)
    },
    handlePublish() {
      this.listQuery.publishStatus = !this.listQuery.publishStatus
      this.listQuery.status = 'published'
      this.getList()
    },
    handleModifyStatus(row, status) {
      row.status = status
      console.log(row)
      updateGame(row.id, row).then(response => {
        this.getList()
        this.$message({
          message: '操作成功',
          type: 'success'
        })
      }).catch(error => console.log(error))
    },
    sortChange(data) {
      const { prop, order } = data
      if (prop === 'id') {
        this.sortByID(order)
      }
    },
    sortByID(order) {
      if (order === 'ascending') {
        this.listQuery.ordering = 'id'
      } else {
        this.listQuery.ordering = '-id'
      }
      this.handleFilter()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        memo: undefined,
        name: '',
        game_type: '',
        status: undefined,
        env: 'TEST',
        game_num: ''
      }
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      console.log('###')
      console.log(this.temp)
      const tempData = Object.assign({}, this.temp)
      createGame(tempData).then(response => {
        this.getList()
      }).catch(error => console.log(error))
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
      this.temp.game_type = row.game_type
      console.log('###', this.temp.game_type)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const tempData = Object.assign({}, this.temp)
          tempData.status = 4
          updateGame(tempData.id, tempData).then(response => {
            this.getList()
            this.dialogFormVisible = false
            this.$notify({
              title: '成功',
              message: '更新成功',
              type: 'success',
              duration: 2000
            })
          }).catch(error => console.log(error))
        }
      })
    },
    handleDelete(row) {
      this.$notify({
        title: '成功',
        message: '删除成功',
        type: 'success',
        duration: 2000
      })
      const index = this.list.indexOf(row)
      this.list.splice(index, 1)
    },
    handleFetchPv(pv) {
      fetchPv(pv).then(response => {
        this.pvData = response.data.pvData
        this.dialogPvVisible = true
      })
    },
    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['序号', '游戏名称', 'gameId', '环境', '当前状态']
        const filterVal = ['id', 'name', 'game_num', 'env', 'status']
        const data = this.formatJson(filterVal, this.list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: 'table-list'
        })
        this.downloadLoading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
