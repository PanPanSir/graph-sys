/**
 * 外部API相关常量
 */
export class XApiConstants {
  //---------------------------------- 请求头类型 ----------------------------------

  // 标准接口请求解析后的原始请求请求超时时间(单位:秒)
  public static readonly ORIGIN_REQUEST_TIMEOUT = 60;
  // 标准接口请求传递的body内容
  public static readonly ORIGIN_REQUEST_BODY = 'origin_request_body';

  //---------------------------------- 标准接口请求通用参数 ----------------------------------
  // 对外暴露接口的系统参数
  public static readonly API_CODE = 'x_api_code'; // 接口编码
  public static readonly ACCESS_KEY = 'x_access_key'; // 接口密钥key
  public static readonly TIMESTAMP = 'x_timestamp'; // 接口访问时间,可选
  public static readonly SIGN = 'x_sign'; // 接口签名,可选
  public static readonly SENDER_ORG_CODE = 'x_sender_org_code'; // 发送方机构统一社会信用代码
  public static readonly RECEIVER_ORG_CODE = 'x_receiver_org_code'; // 接收方机构统一社会信用代码(同时作为路由值)
  public static readonly SENDER_APP_CODE = 'x_sender_app_code'; // 发送方产品编码
  public static readonly RECEIVER_APP_CODE = 'x_receiver_app_code'; // 接收方产品编码

  // 用于幂等的头
  public static readonly HEADER_IDEMPOTENT_ID = 'X-Msg-Id';
  // 请求时间
  public static readonly HEADER_REQUEST_TIME = 'X-Request-Time';
  // 用于防重放攻击的请求头,其值为调用方请求时的时间戳(ms为单位)
  public static readonly HEADER_ANTI_REPLAY_TIMESTAMP = 'X-Ca-Timestamp';
  // 用于防重放攻击的请求头,其值一般为调用方使用UUID生成
  public static readonly HEADER_ANTI_REPLAY_NONCE = 'X-Ca-Nonce';

  //---------------------------------- 请求通用参数 ----------------------------------

  //---------------------------------- 转发请求体相关常量 ----------------------------------
  // application/json、application/xml和text/plain格式仅包括 FORWARD_REQUEST_RAW_BODY
  // application/x-www-form-urlencoded格式仅包括 FORWARD_REQUEST_FORM_DATA_TEXT_BODY
  // multipart/form-data 会包括 FORWARD_REQUEST_FORM_DATA_TEXT_BODY 和 FORWARD_REQUEST_FORM_DATA_BYTE_BODY
  public static readonly FORWARD_REQUEST_RAW_BODY =
    'forward_request_normal_body';
  public static readonly FORWARD_REQUEST_FORM_DATA_TEXT_BODY =
    'forward_request_form_data_text_body';
  public static readonly FORWARD_REQUEST_FORM_DATA_BYTE_BODY =
    'forward_request_form_data_byte_body';
  //---------------------------------- 转发请求体相关常量 ----------------------------------

  //---------------------------------- 转发结果的结构 ----------------------------------
  // 转发结果状态码,200是正常,非200异常
  public static readonly FORWARD_RESULT_CODE = 'forward_result_code';
  // 转发结果数据
  public static readonly FORWARD_RESULT_DATA = 'forward_result_data';
  public static readonly FORWARD_SUCCESS = 'forward_success';
  //---------------------------------- 转发结果的结构 ----------------------------------
}
