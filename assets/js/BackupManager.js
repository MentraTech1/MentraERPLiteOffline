/**
 * MENTRA ERP - Backup Manager System
 * نظام متكامل للنسخ الاحتياطي مع التشفير والضغط والمزامنة
 * Version: 2.0.0 (Fixed & Optimized for Large Files)
 */

class BackupManager {
    constructor() {
        this.db = null;
        this.encryptionKey = null;
        this.backupSchedule = null;
        this.init();
    }

    async init() {
        try {
            this.db = new Dexie("MentraBackupSystem");
            this.db.version(1).stores({
                backups: '++id, filename, timestamp, size, type, encrypted, compressed',
                settings: 'id, auto_backup, schedule, compression, encryption, sync_enabled',
                sync_log: '++id, timestamp, action, status, details'
            });

            await this.generateEncryptionKey();
            await this.loadSettings();
            console.log('🔧 BackupManager initialized successfully');
        } catch (error) {
            console.error('❌ Failed to initialize BackupManager:', error);
        }
    }

    async generateEncryptionKey() {
        if (!this.encryptionKey) {
            const encoder = new TextEncoder();
            const data = encoder.encode('MENTRA_BACKUP_SECURE_KEY_2024');
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            this.encryptionKey = await crypto.subtle.importKey('raw', hashBuffer, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
        }
    }

    async encryptData(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedData = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv }, this.encryptionKey, dataBuffer);
        const result = new Uint8Array(iv.length + encryptedData.byteLength);
        result.set(iv);
        result.set(new Uint8Array(encryptedData), iv.length);
        return Array.from(result);
    }

    async decryptData(encryptedData) {
        const data = new Uint8Array(encryptedData);
        const iv = data.slice(0, 12);
        const encrypted = data.slice(12);
        const decryptedData = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, this.encryptionKey, encrypted);
        const decoder = new TextDecoder();
        return JSON.parse(decoder.decode(decryptedData));
    }

    compressData(data) { return data; } // Placeholder for actual compression if needed
    simpleDecompress(compressed) { return compressed; }

    // دالة مساعدة لفتح قاعدة بيانات المحل الفعلي
    async getTenantDB() {
        const tenantDbName = localStorage.getItem('mentra_current_db');
        if (!tenantDbName) throw new Error('لم يتم العثور على قاعدة بيانات نشطة');
        const tenantDb = new Dexie(tenantDbName);
        tenantDb.version(4).stores({
            products: '++id, name_ar, sku, category, stock_qty, price, cost',
            invoices: '++id, invoice_number, type, customer_vendor_id, date, total, status',
            invoice_items: '++id, invoice_id, product_id, price, qty, total_item',
            accounts: '++id, code, name_ar, type, balance',
            journal: '++id, date, ref_no, description, total',
            journal_items: '++id, journal_id, account_id, debit, credit',
            stock_movements: '++id, product_id, type, qty, date, ref_id',
            settings: 'id, project_name, shop_name, phone, logo',
            local_users: '++id, username, full_name, role',
            active_session: 'id, user_id, login_time'
        });
        await tenantDb.open();
        return tenantDb;
    }

    async createFullBackup(options = {}, onProgress = null) {
        try {
            const startTime = Date.now();
            const tables = ['products', 'invoices', 'invoice_items', 'accounts', 'journal', 'journal_items', 'stock_movements', 'settings'];
            const backupData = {};
            const CHUNK_SIZE = 3000; 

            const tenantDb = await this.getTenantDB();
            let totalRecordsToProcess = 0;
            
            for (const table of tables) {
                if (tenantDb[table]) totalRecordsToProcess += await tenantDb[table].count();
            }

            let processedRecords = 0;

            for (const table of tables) {
                backupData[table] = [];
                if (tenantDb[table]) {
                    const totalInTable = await tenantDb[table].count();
                    for (let i = 0; i < totalInTable; i += CHUNK_SIZE) {
                        const chunk = await tenantDb[table].offset(i).limit(CHUNK_SIZE).toArray();
                        backupData[table].push(...chunk);
                        processedRecords += chunk.length;
                        
                        if (onProgress) {
                            const percent = Math.floor((processedRecords / (totalRecordsToProcess || 1)) * 50);
                            onProgress({ status: `قراءة: ${table}`, percent, details: `سجل ${processedRecords} من ${totalRecordsToProcess}` });
                        }
                        await new Promise(resolve => setTimeout(resolve, 10)); 
                    }
                }
            }

            const userName = localStorage.getItem('userName') || 'مسؤول النظام';
            const metadata = {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                created_by: userName, 
                description: options.description || 'نسخة احتياطية يدوية',
                tables_count: Object.keys(backupData).length,
                total_records: processedRecords
            };

            let processedData = { metadata, data: backupData };

            if (onProgress) onProgress({ status: 'تجهيز البيانات...', percent: 70, details: 'ثواني معدودة' });
            await new Promise(resolve => setTimeout(resolve, 50));

            if (options.encrypt !== false) {
                if (onProgress) onProgress({ status: 'تشفير البيانات...', percent: 85, details: 'أمان AES-256' });
                await new Promise(resolve => setTimeout(resolve, 50));
                processedData = await this.encryptData(processedData);
            }

            const backupInfo = {
                filename: `MENTRA_BACKUP_${new Date().getTime()}.${options.encrypt ? 'enc' : 'json'}`,
                timestamp: new Date().toISOString(),
                size: JSON.stringify(processedData).length,
                type: 'full',
                encrypted: options.encrypt !== false,
                compressed: options.compress !== false,
                metadata: metadata
            };

            await this.db.backups.add(backupInfo);
            await this.logSyncAction('backup_created', 'success', `نسخة: ${backupInfo.filename}`);

            if (onProgress) onProgress({ status: 'اكتملت العملية!', percent: 100, details: 'جاهز للتحميل' });

            return { success: true, filename: backupInfo.filename, data: processedData, metadata: backupInfo, duration: Date.now() - startTime };
        } catch (error) {
            console.error('Backup failed:', error);
            throw new Error(error.message);
        }
    }

    async restoreBackup(backupData, options = {}, onProgress = null) {
        try {
            const startTime = Date.now();
            let processedData = backupData;
            const CHUNK_SIZE = 3000;

            if (onProgress) onProgress({ status: 'فك التشفير...', percent: 10, details: 'تحليل الملف' });
            await new Promise(resolve => setTimeout(resolve, 50));

            if (options.encrypted) processedData = await this.decryptData(backupData);
            let backup = typeof processedData === 'string' ? JSON.parse(processedData) : processedData;

            if (!backup || typeof backup !== 'object' || !backup.metadata || !backup.data) {
                throw new Error('ملف النسخة الاحتياطية غير صالح أو تالف');
            }

            const tenantDb = await this.getTenantDB();

            if (options.clearBeforeRestore) {
                if (onProgress) onProgress({ status: 'تنظيف القاعدة الحالية...', percent: 20, details: 'تهيئة الجداول' });
                const tablesToClear = ['products', 'invoices', 'invoice_items', 'accounts', 'journal', 'journal_items', 'stock_movements'];
                for (const table of tablesToClear) {
                    if (tenantDb[table]) await tenantDb[table].clear();
                }
            }

            const tables = Object.keys(backup.data);
            const totalRecords = backup.metadata.total_records || 1; 
            let recordsRestored = 0;

            for (const tableName of tables) {
                const tableData = backup.data[tableName];
                if (tenantDb[tableName] && Array.isArray(tableData) && tableData.length > 0) {
                    for (let i = 0; i < tableData.length; i += CHUNK_SIZE) {
                        const chunk = tableData.slice(i, i + CHUNK_SIZE);
                        await tenantDb[tableName].bulkPut(chunk);
                        recordsRestored += chunk.length;
                        
                        if (onProgress) {
                            const percent = 20 + Math.floor((recordsRestored / totalRecords) * 75);
                            onProgress({ status: `استعادة: ${tableName}`, percent, details: `سجل ${recordsRestored}` });
                        }
                        await new Promise(resolve => setTimeout(resolve, 10)); 
                    }
                }
            }

            await this.logSyncAction('backup_restored', 'success', `استعادة: ${backup.metadata.description}`);
            if (onProgress) onProgress({ status: 'تمت الاستعادة بنجاح!', percent: 100, details: `المدة: ${Date.now() - startTime}ms` });

            return { success: true, metadata: backup.metadata, tables_restored: tables.length };
        } catch (error) {
            console.error('Restore failed:', error);
            throw new Error(error.message);
        }
    }

    async loadBackupFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const content = e.target.result;
                    if (file.name.endsWith('.enc')) {
                        resolve(new Uint8Array(content));
                    } else {
                        const decoder = new TextDecoder('utf-8');
                        resolve(JSON.parse(content instanceof ArrayBuffer ? decoder.decode(content) : content));
                    }
                } catch (error) {
                    reject(new Error('ملف النسخة الاحتياطية تالف أو غير صالح.'));
                }
            };
            reader.onerror = () => reject(new Error('فشل قراءة الملف'));
            reader.readAsArrayBuffer(file);
        });
    }

    async saveBackupToFile(backupData, filename) {
        try {
            let content = backupData;
            let mimeType = 'application/octet-stream';
            if (!(backupData instanceof Uint8Array)) {
                content = JSON.stringify(backupData);
                mimeType = 'application/json';
                filename = filename.replace('.enc', '.json');
            }
            const blob = new Blob([content], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            return true;
        } catch (error) {
            console.error('Failed to save backup to file:', error);
            return false;
        }
    }

    async loadSettings() {
        try {
            const settings = await this.db.settings.get(1);
            if (!settings) {
                await this.db.settings.add({ id: 1, auto_backup: true, schedule: 'daily', compression: 6, encryption: true, max_backups: 10 });
            }
        } catch (error) { console.error(error); }
    }

    async saveSettings(settings) {
        try {
            await this.db.settings.put({ id: 1, ...settings });
            return true;
        } catch (error) { return false; }
    }

    async logSyncAction(action, status, details) {
        try { await this.db.sync_log.add({ timestamp: new Date().toISOString(), action, status, details }); } catch (e) {}
    }

    async getBackupList() {
        try { return await this.db.backups.orderBy('timestamp').reverse().toArray(); } catch (e) { return []; }
    }

    async deleteBackup(backupId) {
        try { await this.db.backups.delete(backupId); return true; } catch (e) { return false; }
    }
}

window.backupManager = new BackupManager();