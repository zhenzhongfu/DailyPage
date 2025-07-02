// 引入依赖
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const APP_ID = process.env.FEISHU_APP_ID;
const APP_SECRET = process.env.FEISHU_APP_SECRET;
const NODE_TOKEN = process.env.FEISHU_NODE_TOKEN;
const TABLE_ID = process.env.FEISHU_TABLE_ID;
const VIEW_ID = process.env.FEISHU_VIEW_ID;
const DAILY_TABLE_ID = process.env.FEISHU_DAILY_TABLE_ID; // 新增：每日思考的表格ID

if (!APP_ID || !APP_SECRET || !NODE_TOKEN || !TABLE_ID || !VIEW_ID) {
  console.error('请在.env文件中配置所有飞书API参数');
  process.exit(1);
}

// 缓存 access_token 及过期时间
let cachedToken = null;
let cachedExpire = 0;

// 获取 tenant_access_token
async function getTenantAccessToken() {
  // 如果 token 未过期直接返回
  if (cachedToken && Date.now() < cachedExpire - 60 * 1000) {
    return cachedToken;
  }
  const res = await axios.post('https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal', {
    app_id: APP_ID,
    app_secret: APP_SECRET
  });
  if (res.data.code !== 0) {
    throw new Error('获取 tenant_access_token 失败: ' + JSON.stringify(res.data));
  }
  cachedToken = res.data.tenant_access_token;
  cachedExpire = Date.now() + res.data.expire * 1000;
  return cachedToken;
}

// 通用请求，自动处理 token 失效重试
async function requestWithToken(config, retry = true) {
  const token = await getTenantAccessToken();
  config.headers = config.headers || {};
  config.headers.Authorization = `Bearer ${token}`;
  try {
    return await axios(config);
  } catch (e) {
    // token 失效时自动刷新重试
    if (retry && e.response && e.response.data && e.response.data.code === 99991668) {
      cachedToken = null;
      return requestWithToken(config, false);
    }
    throw e;
  }
}

// 1. 获取 obj_token
async function getObjToken() {
  const res = await requestWithToken({
    method: 'get',
    url: 'https://open.feishu.cn/open-apis/wiki/v2/spaces/get_node',
    params: {
      obj_type: process.env.FEISHU_OBJ_TYPE,
      token: process.env.FEISHU_NODE_TOKEN,
    }
  });
  return res.data.data.node.obj_token;
}

// 2. 查询主内容数据
async function fetchBitableData(obj_token) {
  const body = {
    view_id: VIEW_ID,
    field_names: [
      'id', '链接', '平台', '标签', '账号', '标题', '正文', '发布时间', '封面'
    ],
    sort: [
      { field_name: '发布时间', desc: true }
    ],
    filter: {
      conjunction: 'and',
      conditions: [
      ]
    },
    automatic_fields: false
  };

  const res = await requestWithToken({
    method: 'post',
    url: `https://open.feishu.cn/open-apis/bitable/v1/apps/${obj_token}/tables/${TABLE_ID}/records/search`,
    data: body,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (!res.data || !res.data.data || !res.data.data.items) {
    console.error('API返回格式异常:', JSON.stringify(res.data));
    return [];
  }
  console.log('主内容接口返回:', res.data.data.items.length, '条');
  return res.data.data.items;
}

// 3. 查询每日思考数据
async function fetchDailyThoughts(obj_token) {
    const body = {
    // 注意：每日思考的 view_id 可能与主内容不同，这里暂时复用，如果需要请在 .env 中单独配置
    // view_id: process.env.FEISHU_DAILY_VIEW_ID || VIEW_ID,
    field_names: [ '思考', '创建时间' ], // 假设字段名为'思考'和'创建时间'，请根据实际情况修改
    sort: [
      { field_name: '创建时间', desc: true }
    ],
     automatic_fields: false
  };

  const res = await requestWithToken({
    method: 'post',
    url: `https://open.feishu.cn/open-apis/bitable/v1/apps/${obj_token}/tables/${DAILY_TABLE_ID}/records/search`,
    data: body,
    headers: {
      'Content-Type': 'application/json'
    }
  });
  console.log('每日思考接口返回:', res.data.data.items.length, '条');
  return res.data.data.items;
}


(async () => {
  try {
    const obj_token = await getObjToken();

    // 获取主内容和每日思考
    const contentData = await fetchBitableData(obj_token);
    // const dailyThoughtsData = await fetchDailyThoughts(obj_token);

    // 确保 public 目录存在
    const publicDir = path.join(__dirname, '..', 'public');
    if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

    // 写入文件
    fs.writeFileSync(path.join(publicDir, 'content-data.json'), JSON.stringify(contentData, null, 2));
    console.log('主内容数据已保存到 public/content-data.json');

    // fs.writeFileSync(path.join(publicDir, 'daily-thoughts.json'), JSON.stringify(dailyThoughtsData, null, 2));
    // console.log('每日思考数据已保存到 public/daily-thoughts.json');

  } catch (e) {
    console.error('同步失败:', e.response?.data || e.message);
  }
})();
 