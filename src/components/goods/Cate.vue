<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- form表单占位 -->
      <tree-table :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index
                  index-text="#" border class="treeTable">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: lightgreen"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页占位 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3,5,10,20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <!-- 添加分类表单 -->
      <el-form :model="addDCateForm" :rules="addDCateFormRules" ref="addDCateFormRef" label-width="100px"
               class="addDCateForm">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addDCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- options 用来指定数据源 -->
          <!-- props用来制定配置对象-->
          <el-cascader expand-trigger="hover"
                       :options="parentCateList"
                       :props="casCaderProps"
                       v-model="selectedKeys"
                       @change="parenCateChanged"
                       clearable change-on-select></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取消</el-button>
        <el-button @click="addCate" type="primary">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 商品分类列表，默认为空
      catelist: [],
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 10
      },
      // 总数居条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template', // 制定这一列为模板列
          template: 'isok' // 当前列模板名称
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 添加分类对话框显示与否
      addCateDialogVisible: false,
      // 添加分类表单数据对象
      addDCateForm: {
        cat_name: '',
        // 父级分类的id
        cat_pid: 0,
        // 默认分类的等级是1级分类
        cat_level: 0
      },
      // 父级分类列表
      parentCateList: [],
      // 指定级联选择器的配置对象
      casCaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中父级分类的id数组
      selectedKeys: [],
      // 添加分类表单的验证规则
      addDCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCateList()
  },
  methods: {
    // 获取商品分类
    async getCateList () {
      const { data: res } = await this.$http.get('categories/', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      // 为商品列表赋值
      this.catelist = res.data.result
      // 为总数居条数赋值
      this.total = res.data.total
    },
    // 监听pagesize事件
    handleSizeChange (newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听pagenum
    handleCurrentChange (newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 显示添加分类对话框
    showAddCateDialog () {
      // 获取父级列表
      this.getParentCateList()
      // 展示对话框
      this.addCateDialogVisible = true
    },
    // 获取父级分类
    async getParentCateList () {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) return this.$message.error('获取父级分类失败')
      this.parentCateList = res.data
    },
    // 选择项发生变化触发这个函数
    parenCateChanged () {
      if (this.selectedKeys.length > 0) {
        // 父级分类id
        this.addDCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 当前分类等级赋值
        this.addDCateForm.cat_level = this.selectedKeys.length
      } else {
        // 父级分类id
        this.addDCateForm.cat_pid = 0
        // 当前分类等级赋值
        this.addDCateForm.cat_level = 0
      }
    },
    // 添加新分类
    addCate () {
      this.$refs.addDCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addDCateForm)
        if (res.meta.status !== 201) return this.$message.error('添加分类失败')
        this.$message.success('添加分类成功')
        await this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框关闭事件重置表单
    addCateDialogClosed () {
      this.$refs.addDCateFormRef.resetFields()
      this.selectedKeys = []
      this.addDCateForm.cat_level = 0
      this.addDCateForm.cat_pid = 0
    }
  }

}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 10px;
}

.addDCateForm {
  .el-input {
    width: 90%;
  }

  .el-cascader {
    width: 90%;
  }
}
</style>
