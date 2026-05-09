const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'data');
const usersDir = path.join(dataDir, 'users');
const balanceFile = path.join(dataDir, 'balance.json');
const sessionsDir = path.join(dataDir, 'sessions');

const memoryCache = {
    users: new Map(),
    balance: new Map(),
    lastSync: Date.now()
};

function initDatabase() {
    try {
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
        if (!fs.existsSync(usersDir)) fs.mkdirSync(usersDir, { recursive: true });
        if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir, { recursive: true });
        if (!fs.existsSync(balanceFile)) fs.writeFileSync(balanceFile, JSON.stringify({}, null, 2));
        
        const balanceData = JSON.parse(fs.readFileSync(balanceFile, 'utf8'));
        Object.entries(balanceData).forEach(([userId, balance]) => {
            memoryCache.balance.set(userId, parseFloat(balance));
        });
        
        console.log('[Database] ✅ ระบบฐานข้อมูลพร้อมใช้งาน');
    } catch (error) {
        console.error('[Database] ❌ Error:', error.message);
    }
}

function syncBalanceToDisk() {
    try {
        const balanceObj = {};
        memoryCache.balance.forEach((value, key) => {
            balanceObj[key] = value;
        });
        fs.writeFileSync(balanceFile, JSON.stringify(balanceObj, null, 2), 'utf8');
        memoryCache.lastSync = Date.now();
    } catch (error) {
        console.error('[Database] ❌ Sync error:', error.message);
    }
}

function getUserData(userId) {
    try {
        if (memoryCache.users.has(userId)) return memoryCache.users.get(userId);
        
        const filePath = path.join(usersDir, `${userId}.json`);
        if (!fs.existsSync(filePath)) return null;
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        memoryCache.users.set(userId, data);
        return data;
    } catch (error) {
        return null;
    }
}

function saveUserData(userId, data) {
    try {
        const filePath = path.join(usersDir, `${userId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        memoryCache.users.set(userId, data);
        return true;
    } catch (error) {
        return false;
    }
}

function deleteUserData(userId) {
    try {
        const filePath = path.join(usersDir, `${userId}.json`);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        
        const sessionPath = path.join(sessionsDir, `${userId}.session`);
        if (fs.existsSync(sessionPath)) fs.unlinkSync(sessionPath);
        
        memoryCache.users.delete(userId);
        memoryCache.balance.delete(userId);
        syncBalanceToDisk();
        return true;
    } catch (error) {
        return false;
    }
}

function saveSession(userId, sessionString) {
    try {
        const sessionPath = path.join(sessionsDir, `${userId}.session`);
        fs.writeFileSync(sessionPath, sessionString, 'utf8');
        return true;
    } catch (error) {
        return false;
    }
}

function getSession(userId) {
    try {
        const sessionPath = path.join(sessionsDir, `${userId}.session`);
        if (!fs.existsSync(sessionPath)) return '';
        return fs.readFileSync(sessionPath, 'utf8').trim();
    } catch (error) {
        return '';
    }
}

function getAllUsers() {
    try {
        const files = fs.readdirSync(usersDir).filter(f => f.endsWith('.json'));
        return files.map(f => f.replace('.json', ''));
    } catch (error) {
        return [];
    }
}

function getBalance(userId) {
    return memoryCache.balance.get(userId) || 0;
}

function addBalance(userId, amount) {
    try {
        const current = memoryCache.balance.get(userId) || 0;
        const newBalance = current + parseFloat(amount);
        memoryCache.balance.set(userId, newBalance);
        setImmediate(() => syncBalanceToDisk());
        return newBalance;
    } catch (error) {
        return 0;
    }
}

function setBalance(userId, amount) {
    try {
        const balance = parseFloat(amount);
        memoryCache.balance.set(userId, balance);
        setImmediate(() => syncBalanceToDisk());
        return balance;
    } catch (error) {
        return 0;
    }
}

function clearMemoryCache() {
    const size = memoryCache.users.size;
    memoryCache.users.clear();
    console.log(`[Database] 🧹 ล้าง Cache ${size} รายการ`);
}

function getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024),
        rss: Math.round(usage.rss / 1024 / 1024)
    };
}

module.exports = {
    initDatabase,
    getUserData,
    saveUserData,
    deleteUserData,
    getAllUsers,
    getBalance,
    addBalance,
    setBalance,
    syncBalanceToDisk,
    clearMemoryCache,
    getMemoryUsage,
    saveSession,
    getSession
};