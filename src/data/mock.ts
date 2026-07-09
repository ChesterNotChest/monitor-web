export interface Alert{id:string;title:string;severity:'danger'|'warning'|'caution';cameraView:string;timestamp:string;status:'pending'|'resolved'|'false-alarm';type:string}
export interface Camera{id:string;name:string;status:'online'|'offline'}
export interface KpiStat{label:string;value:number;trend:number;iconName:string}
export interface LogEntry{time:string;camera:string;event:string;status:'pending'|'resolved'}
export interface User{id:string;name:string;role:string;permission:string;accountStatus:string}
export interface Character{id:string;name:string}
export interface Device{name:string;status:'online'|'offline'|'alert'}
export interface DeviceNode{id:string;name:string;abnormal:boolean;video:Device[];audio:Device[]}
export interface ExceptionType{id:string;name:string;severity:'danger'|'warning'|'caution';enabled:boolean;selected:boolean;events:string[]}
export interface ReportRow{seq:number;time:string;camera:string;event:string;severity:'danger'|'warning'|'caution';status:string}
export interface WeeklyReportRow{seq:number;time:string;date:string;camera:string;event:string;severity:'danger'|'warning'|'caution';status:string}

export const mockKpiStats:KpiStat[]=[
  {label:'视图数',value:9,trend:0,iconName:'Eye'},{label:'监控数',value:24,trend:8,iconName:'Radio'},
  {label:'今日告警',value:17,trend:-3,iconName:'Bell'},{label:'已解决',value:12,trend:20,iconName:'CheckCircle'},
  {label:'待处理',value:5,trend:25,iconName:'AlertTriangle'},
];

export const mockCameras:Camera[]=Array.from({length:9},(_,i)=>({id:`cam-0${i+1}`,name:`视图0${i+1}`,status:i<7?'online':'offline'}));

export const mockAlerts:Alert[]=[
  {id:'alert-001',title:'危险区域闯入',severity:'danger',cameraView:'1号车间监控',timestamp:'2026-07-09 14:23:15',status:'pending',type:'危险区域入侵'},
  {id:'alert-002',title:'打架行为检测',severity:'danger',cameraView:'视图06',timestamp:'2026-07-09 13:50:19',status:'pending',type:'暴力行为'},
  {id:'alert-003',title:'陌生人识别告警',severity:'danger',cameraView:'视图01',timestamp:'2026-07-09 12:45:52',status:'pending',type:'陌生人识别'},
  {id:'alert-004',title:'异常声音告警',severity:'warning',cameraView:'视图03',timestamp:'2026-07-09 11:17:23',status:'pending',type:'异常声音'},
  {id:'alert-005',title:'跌倒行为检测',severity:'warning',cameraView:'视图04',timestamp:'2026-07-09 10:36:08',status:'pending',type:'跌倒检测'},
  {id:'alert-006',title:'抽烟行为检测',severity:'caution',cameraView:'视图05',timestamp:'2026-07-09 09:23:15',status:'pending',type:'抽烟检测'},
  {id:'alert-007',title:'异常停留告警',severity:'caution',cameraView:'视图02',timestamp:'2026-07-09 08:08:41',status:'pending',type:'异常停留'},
];

export const mockLogEntries:LogEntry[]=[
  {time:'16:17',camera:'视图03',event:'异常声音告警',status:'pending'},{time:'14:36',camera:'视图04',event:'跌倒行为检测',status:'pending'},
  {time:'11:08',camera:'视图02',event:'异常停留告警',status:'resolved'},{time:'10:23',camera:'视图05',event:'抽烟行为检测',status:'resolved'},
  {time:'09:45',camera:'视图01',event:'陌生人识别告警',status:'pending'},{time:'08:12',camera:'视图03',event:'危险区域闯入',status:'resolved'},
];

export const mockReportDates=['2026-07-09','2026-07-08','2026-07-07','2026-07-06','2026-07-05','2026-07-04'];

export const mockWeeks=[{label:'第27周',range:'07.07-07.13'},{label:'第26周',range:'06.30-07.06'},{label:'第25周',range:'06.23-06.29'},{label:'第24周',range:'06.16-06.22'},{label:'第23周',range:'06.09-06.15'},{label:'第22周',range:'06.02-06.08'}];

export const mockUsers:User[]=[
  {id:'user-1',name:'用户1',role:'安全员',permission:'二级',accountStatus:'正常'},
  {id:'user-2',name:'用户2',role:'管理员',permission:'一级',accountStatus:'正常'},
  {id:'user-3',name:'用户3',role:'观察员',permission:'三级',accountStatus:'正常'},
];

export const mockCharacters:Character[]=[{id:'char-1',name:'人物名1'},{id:'char-2',name:'人物名2'},{id:'char-3',name:'人物名3'}];

export const mockDeviceNodes:DeviceNode[]=[
  {id:'node-1',name:'node1',abnormal:false,video:[{name:'设备名1',status:'online'},{name:'设备名2',status:'online'}],audio:[{name:'设备名1',status:'online'},{name:'设备名2',status:'online'}]},
  {id:'node-2',name:'node2',abnormal:true,video:[{name:'设备名1',status:'alert'},{name:'设备名2',status:'alert'}],audio:[{name:'设备名1',status:'alert'},{name:'设备名2',status:'alert'}]},
  {id:'node-3',name:'node3',abnormal:false,video:[{name:'设备名1',status:'online'},{name:'设备名2',status:'online'}],audio:[{name:'设备名1',status:'online'},{name:'设备名2',status:'online'}]},
  {id:'node-4',name:'node4',abnormal:false,video:[{name:'设备名1',status:'online'},{name:'设备名2',status:'online'}],audio:[{name:'设备名1',status:'online'},{name:'设备名2',status:'online'}]},
];

export const mockExceptionTypes:ExceptionType[]=[
  {id:'ex-1',name:'陌生人识别告警',severity:'danger',enabled:true,selected:false,events:['人脸特征比对','黑名单匹配','陌生度评分']},
  {id:'ex-2',name:'危险区域闯入',severity:'warning',enabled:true,selected:true,events:['人员进入区域检测','边界靠近检测','停留超时检测']},
  {id:'ex-3',name:'异常停留告警',severity:'caution',enabled:true,selected:false,events:['区域划定','停留时长统计','超时判断']},
  {id:'ex-4',name:'抽烟行为检测',severity:'warning',enabled:false,selected:false,events:['烟雾特征识别','手势动作分析']},
  {id:'ex-5',name:'跌倒行为检测',severity:'danger',enabled:true,selected:false,events:['人体姿态估计','倒地动作识别','静止时长判断']},
  {id:'ex-6',name:'打架行为检测',severity:'danger',enabled:true,selected:false,events:['多人交互检测','暴力动作识别','异常声音辅助']},
  {id:'ex-7',name:'异常声音检测',severity:'caution',enabled:false,selected:false,events:['声音波形采集','异常频率识别','分贝阈值判断']},
  {id:'ex-8',name:'异常物品检测',severity:'caution',enabled:true,selected:false,events:['遗留物识别','物品位移检测']},
];

export const mockWeeklyReportRows:WeeklyReportRow[]=[
  {seq:1,time:'14:23:15',date:'07.07',camera:'1号车间监控',event:'危险区域闯入',severity:'danger',status:'已处理'},
  {seq:2,time:'10:36:08',date:'07.07',camera:'视图04',event:'跌倒行为检测',severity:'danger',status:'已处理'},
  {seq:3,time:'16:17:23',date:'07.08',camera:'视图03',event:'异常声音告警',severity:'warning',status:'已处理'},
  {seq:4,time:'14:36:08',date:'07.08',camera:'视图04',event:'跌倒行为检测',severity:'danger',status:'已处理'},
  {seq:5,time:'11:08:41',date:'07.08',camera:'视图02',event:'异常停留告警',severity:'caution',status:'标记误报'},
  {seq:6,time:'10:23:15',date:'07.08',camera:'视图05',event:'抽烟行为检测',severity:'warning',status:'已处理'},
  {seq:7,time:'09:45:52',date:'07.08',camera:'视图01',event:'陌生人识别告警',severity:'danger',status:'已处理'},
  {seq:8,time:'08:12:37',date:'07.08',camera:'视图03',event:'危险区域闯入',severity:'danger',status:'标记误报'},
  {seq:9,time:'07:50:19',date:'07.08',camera:'视图06',event:'打架行为检测',severity:'danger',status:'已处理'},
  {seq:10,time:'15:30:42',date:'07.09',camera:'视图01',event:'危险区域闯入',severity:'danger',status:'已处理'},
  {seq:11,time:'12:18:55',date:'07.09',camera:'视图05',event:'抽烟行为检测',severity:'warning',status:'未处理'},
  {seq:12,time:'09:05:33',date:'07.10',camera:'视图02',event:'异常停留告警',severity:'caution',status:'已处理'},
  {seq:13,time:'16:42:11',date:'07.10',camera:'视图06',event:'打架行为检测',severity:'danger',status:'未处理'},
  {seq:14,time:'08:30:27',date:'07.11',camera:'视图03',event:'异常声音告警',severity:'warning',status:'已处理'},
  {seq:15,time:'14:15:09',date:'07.11',camera:'视图04',event:'跌倒行为检测',severity:'danger',status:'已处理'},
];

export const mockReportRows:ReportRow[]=[
  {seq:1,time:'2026-07-08 16:17:23',camera:'视图03',event:'异常声音告警',severity:'warning',status:'已处理'},
  {seq:2,time:'2026-07-08 14:36:08',camera:'视图04',event:'跌倒行为检测',severity:'danger',status:'已处理'},
  {seq:3,time:'2026-07-08 11:08:41',camera:'视图02',event:'异常停留告警',severity:'caution',status:'标记误报'},
  {seq:4,time:'2026-07-08 10:23:15',camera:'视图05',event:'抽烟行为检测',severity:'warning',status:'已处理'},
  {seq:5,time:'2026-07-08 09:45:52',camera:'视图01',event:'陌生人识别告警',severity:'danger',status:'已处理'},
  {seq:6,time:'2026-07-08 08:12:37',camera:'视图03',event:'危险区域闯入',severity:'danger',status:'标记误报'},
  {seq:7,time:'2026-07-08 07:50:19',camera:'视图06',event:'打架行为检测',severity:'danger',status:'已处理'},
];
