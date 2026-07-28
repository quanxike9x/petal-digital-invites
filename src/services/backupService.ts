import { mockInvitations, mockUsers, mockPayments, mockTemplates } from '../data/mockData';

export const backupService = {
  /**
   * Export full system data dump into a single JSON file
   */
  exportFullDatabaseBackup: (): void => {
    const backupData = {
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      platform: 'Pudwedding Platform',
      users: mockUsers,
      invitations: mockInvitations,
      payments: mockPayments,
      templates: mockTemplates,
      storage_key: 'pudwedding_media_store',
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `Pudwedding_FullBackup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Restore database from JSON backup file
   */
  restoreDatabaseBackup: (jsonContent: string): boolean => {
    try {
      const parsed = JSON.parse(jsonContent);
      if (parsed.platform && parsed.exported_at) {
        if (parsed.users) localStorage.setItem('pudwedding_backup_users', JSON.stringify(parsed.users));
        if (parsed.invitations) localStorage.setItem('pudwedding_backup_invitations', JSON.stringify(parsed.invitations));
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },
};
