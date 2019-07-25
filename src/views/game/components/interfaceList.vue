<template>
  <div class="app-container">
    <div class="filter-container">

      <el-input v-model="listQuery.name" placeholder="接口名称" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter"/>

      <el-select v-model="listQuery.request_protocol" placeholder="协议" clearable style="width: 90px" class="filter-item">
        <el-option v-for="item in protocolOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
      </el-select>

      <el-select v-model="listQuery.app_name" placeholder="应用" clearable class="filter-item" style="width: 130px">
        <el-option v-for="item in appOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
      </el-select>

      <el-select v-model="listQuery.ordering" style="width: 140px" class="filter-item" @change="handleFilter">
        <el-option v-for="item in sortOptions" :key="item.key" :label="item.label" :value="item.key"/>
      </el-select>

      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">{{ $t('table.search') }}</el-button>
      <el-button class="filter-item" style="margin-left: 10px;" type="primary" icon="el-icon-edit" @click="handleCreate">{{ $t('table.add') }}</el-button>
      <el-button v-waves :loading="downloadLoading" class="filter-item" type="primary" icon="el-icon-download" @click="handleDownload">{{ $t('table.export') }}</el-button>

      <!--<el-checkbox v-model="showChannel" class="filter-item" style="margin-left:15px;" @change="tableKey=tableKey+1">渠道</el-checkbox>-->
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

      <el-table-column label="接口名称" min-width="50px" align="center">
        <template slot-scope="scope">
          <span class="link-type" @click="handleUpdate(scope.row)">{{ scope.row.name }}</span>
          <el-tag>{{ scope.row.request_protocol | protocolFilter }}</el-tag>
          <el-tag v-if="scope.row.request_method !== 0">{{ scope.row.request_method | methodFilter }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="接口路径" min-width="50px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.path }}</span>
        </template>
      </el-table-column>

      <el-table-column label="项目编号" min-width="20px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.project }}</span>
        </template>
      </el-table-column>

      <el-table-column label="socketIO路由" min-width="20px" align="center">
        <template slot-scope="scope">
          <span v-text="scope.row.route?scope.row.route:''"/>
        </template>
      </el-table-column>

      <el-table-column label="应用名" min-width="20px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.app_name | appFilter }}</span>
        </template>
      </el-table-column>

      <el-table-column :label="$t('table.actions')" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleUpdate(scope.row)">{{ $t('table.edit') }}</el-button>
          <el-button size="mini" type="success" @click="handleModifyStatus(scope.row, 4)">detail
          </el-button>

          <el-button size="mini" type="danger" @click="deleteInterfaceInfoInfo(scope.row.id)">{{ $t('table.delete') }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">

        <el-form-item label="接口名称" prop="name">
          <el-input v-model="temp.name"/>
        </el-form-item>

        <el-form-item label="请求协议" prop="game_type">
          <el-select v-model="temp.request_protocol" class="filter-item" placeholder="Please select">
            <el-option v-for="item in protocolOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
          </el-select>
        </el-form-item>

        <el-form-item v-if="temp.request_protocol===0" label="请求方式" >
          <el-select v-model="temp.request_method" class="filter-item" placeholder="Please select">
            <el-option v-for="item in methodOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
          </el-select>
        </el-form-item>

        <el-form-item label="应用">
          <el-select v-model="temp.app_name" class="filter-item" placeholder="Please select">
            <el-option v-for="item in appOptions" :key="item.key" :label="item.display_name" :value="item.key"/>
          </el-select>
        </el-form-item>

        <el-form-item label="项目ID" prop="project">
          <el-input v-model="temp.project"/>
        </el-form-item>

        <el-form-item v-if="temp.request_protocol===2" label="socketIO路由" prop="route" align="center" >
          <el-input v-model="temp.route"/>
        </el-form-item>

        <el-form-item label="请求路径">
          <el-input :autosize="{ minRows: 2, maxRows: 4}" v-model="temp.path" type="textarea" placeholder="Please input"/>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">{{ $t('table.cancel') }}</el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">{{ $t('table.confirm') }}</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import waves from '@/directive/waves' // Waves directive
import { parseTime } from '@/utils'
import Pagination from '@/components/Pagination' // Secondary package based on el-pagination
import { getInterfaceInfoList, deleteInterfaceInfo, createInterfaceInfo, updateInterfaceInfo } from '@/api/article'

const protocolOptions = [
  { key: 0, display_name: 'HTTP' },
  { key: 1, display_name: 'PRIMUS' },
  { key: 2, display_name: 'socketIO' },
  { key: 3, display_name: 'RPC' },
  { key: 4, display_name: 'dubbo' }
]

const methodOptions = [
  { key: 0, display_name: '无' },
  { key: 1, display_name: 'POST' },
  { key: 2, display_name: 'DELETE' },
  { key: 3, display_name: 'PUT' },
  { key: 4, display_name: 'PATCH' },
  { key: 5, display_name: 'GET' }
]

const appOptions = [
  { key: 0, display_name: 'WAP' },
  { key: 1, display_name: 'ADMIN' },
  { key: 2, display_name: 'NODE' },
  { key: 3, display_name: 'JAVA' }
]

function getOptionsKeyValue(optionList, keyName) {
  const results = optionList.reduce((acc, cur) => {
    acc[cur.key] = cur.display_name
    return acc
  }, {})
  return results[keyName]
}

export default {
  name: 'InterfaceList',
  components: { Pagination },
  directives: { waves },
  filters: {
    protocolFilter(protocol) {
      return getOptionsKeyValue(protocolOptions, protocol)
    },

    methodFilter(method) {
      return getOptionsKeyValue(methodOptions, method)
    },

    appFilter(app) {
      return getOptionsKeyValue(appOptions, app)
    }

  },
  data() {
    return {
      tableKey: 0,
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        name: undefined,
        page: 1,
        limit: 20,
        request_protocol: undefined,
        request_method: undefined,
        app_name: undefined,
        ordering: 'id'
      },
      importanceOptions: [1, 2, 3],
      protocolOptions,
      sortOptions: [{ label: '升序', key: '+id' }, { label: '降序', key: '-id' }],

      methodOptions,
      appOptions,
      envOptions: ['dev', 'test', 'prd'],
      showChannel: false,
      temp: {
        id: undefined,
        path: undefined,
        name: '',
        request_protocol: undefined,
        request_method: 0,
        route: undefined,
        app_name: undefined,
        project: undefined
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: 'Edit',
        create: 'Create'
      },
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
    this.dialogFormVisible = false
  },

  methods: {

    getList(params) {
      this.listLoading = true
      getInterfaceInfoList(params).then(response => {
        console.log(response)
        const items = response.data.results
        this.list = items.map(v => {
          this.$set(v, 'edit', false) // https://vuejs.org/v2/guide/reactivity.html
          v.name = v.name //  will be used when user click the cancel botton
          console.log(v)
          return v
        })
        this.total = response.data.length
        console.error(response.data.length)
        this.listLoading = false
      }).catch(error => console.log(error))
    },
    deleteInterfaceInfoInfo(id) {
      this.listLoading = true
      deleteInterfaceInfo(id).then(response => {
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
      updateInterfaceInfo(row.id, row).then(response => {
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
        path: undefined,
        name: undefined,
        request_protocol: undefined,
        request_method: 0,
        route: undefined,
        app_name: undefined,
        project: undefined
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
      createInterfaceInfo(tempData).then(response => {
        this.getList()
        this.dialogFormVisible = false
      }).catch(error => {
        console.error(error)
        this.$notify({
          title: '失败',
          message: '更新失败, 请查看console日志',
          type: 'error',
          duration: 2000
        })
      }

      )
    },
    handleUpdate(row) {
      this.temp = Object.assign({}, row) // copy obj
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
          updateInterfaceInfo(tempData.id, tempData).then(response => {
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

    handleDownload() {
      this.downloadLoading = true
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['序号', '接口名称', '接口地址', '项目编号', 'socketIO路由', '请求协议', '请求方法', '应用名']
        const filterVal = ['id', 'name', 'path', 'project', 'route', 'request_protocol', 'request_method', 'app_name']
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
        } else if (j === 'request_protocol') {
          const temp_data = v[j]
          v[j] = getOptionsKeyValue(protocolOptions, temp_data)
          return v[j]
        } else if (j === 'request_method') {
          const temp_data = v[j]
          v[j] = getOptionsKeyValue(methodOptions, temp_data)
          return v[j]
        } else if (j === 'app_name') {
          const temp_data = v[j]
          v[j] = getOptionsKeyValue(appOptions, temp_data)
          return v[j]
        } else {
          return v[j]
        }
      }))
    }
  }
}
</script>
