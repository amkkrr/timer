// db.js 完整代码
import Dexie from './dexie.mjs';

// 初始化数据库
const db = new Dexie("TimerAppDB");

// 定义存储表结构
db.version(1).stores({
    records: '++id, startTime, endTime, duration, purpose'
});

// 插入记录
export async function addRecord(record) {
    try {
        return await db.records.add(record);
    } catch (error) {
        console.error("添加记录时发生错误：", {
            message: error?.message,
            stack: error?.stack,
            record: record
        });
        throw error; // 保留异常，便于调用者处理
    }
}

// 获取所有记录
export async function getAllRecords() {
    try {
        return await db.records.toArray();
    } catch (error) {
        console.error("获取所有记录时发生错误：", {
            message: error?.message,
            stack: error?.stack
        });
        throw error;
    }
}

// 删除记录
export async function deleteRecord(id) {
    try {
        return await db.records.delete(id);
    } catch (error) {
        console.error("删除记录时发生错误：", {
            message: error?.message,
            stack: error?.stack,
            recordId: id
        });
        throw error;
    }
}
