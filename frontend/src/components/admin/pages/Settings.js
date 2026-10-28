import React, { useState, useEffect } from 'react';
import { Save, DollarSign, Bell, Shield, Database, Mail } from 'lucide-react';
import './Settings.css';

const Settings = () => {
    const [activeSection, setActiveSection] = useState('fare');
    const [settings, setSettings] = useState({
        baseFare: 50,
        perKmRate: 10,
        perMinuteRate: 2,
        commissionRate: 15,
        cancellationFee: 20,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        bookingAlerts: true,
        paymentAlerts: true,
        systemAlerts: true,
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/admin/settings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8080/api/admin/settings', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                alert('✅ Settings saved successfully');
            } else {
                alert('❌ Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('❌ Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    return (
        <div className="settings-page">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h2>Settings & Configuration</h2>
                    <p>Manage system settings and preferences</p>
                </div>
                <button className="save-btn" onClick={handleSave} disabled={saving}>
                    <Save size={18} />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            {/* Settings Navigation */}
            <div className="settings-nav">
                <button
                    className={`settings-nav-btn ${activeSection === 'fare' ? 'active' : ''}`}
                    onClick={() => setActiveSection('fare')}
                >
                    <DollarSign size={18} />
                    Fare Settings
                </button>
                <button
                    className={`settings-nav-btn ${activeSection === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveSection('notifications')}
                >
                    <Bell size={18} />
                    Notifications
                </button>
                <button
                    className={`settings-nav-btn ${activeSection === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveSection('security')}
                >
                    <Shield size={18} />
                    Security
                </button>
                <button
                    className={`settings-nav-btn ${activeSection === 'system' ? 'active' : ''}`}
                    onClick={() => setActiveSection('system')}
                >
                    <Database size={18} />
                    System
                </button>
            </div>

            {/* Settings Content */}
            <div className="settings-content">
                {activeSection === 'fare' && (
                    <FareSettings settings={settings} onChange={handleChange} />
                )}
                {activeSection === 'notifications' && (
                    <NotificationSettings settings={settings} onChange={handleChange} />
                )}
                {activeSection === 'security' && (
                    <SecuritySettings settings={settings} onChange={handleChange} />
                )}
                {activeSection === 'system' && (
                    <SystemSettings settings={settings} onChange={handleChange} />
                )}
            </div>
        </div>
    );
};

// Fare Settings Component
const FareSettings = ({ settings, onChange }) => (
    <div className="settings-section">
        <h3>Fare Configuration</h3>
        <p className="section-description">Configure pricing and commission rates</p>

        <div className="settings-grid">
            <SettingField
                label="Base Fare"
                description="Starting fare for each ride"
                type="number"
                value={settings.baseFare}
                onChange={(value) => onChange('baseFare', parseFloat(value))}
                prefix="₹"
            />
            <SettingField
                label="Per Kilometer Rate"
                description="Charge per kilometer"
                type="number"
                value={settings.perKmRate}
                onChange={(value) => onChange('perKmRate', parseFloat(value))}
                prefix="₹"
            />
            <SettingField
                label="Per Minute Rate"
                description="Charge per minute"
                type="number"
                value={settings.perMinuteRate}
                onChange={(value) => onChange('perMinuteRate', parseFloat(value))}
                prefix="₹"
            />
            <SettingField
                label="Commission Rate"
                description="Platform commission percentage"
                type="number"
                value={settings.commissionRate}
                onChange={(value) => onChange('commissionRate', parseFloat(value))}
                suffix="%"
            />
            <SettingField
                label="Cancellation Fee"
                description="Fee for ride cancellation"
                type="number"
                value={settings.cancellationFee}
                onChange={(value) => onChange('cancellationFee', parseFloat(value))}
                prefix="₹"
            />
        </div>
    </div>
);

// Notification Settings Component
const NotificationSettings = ({ settings, onChange }) => (
    <div className="settings-section">
        <h3>Notification Preferences</h3>
        <p className="section-description">Configure notification channels and alerts</p>

        <div className="settings-list">
            <ToggleSetting
                label="Email Notifications"
                description="Receive notifications via email"
                checked={settings.emailNotifications}
                onChange={(checked) => onChange('emailNotifications', checked)}
            />
            <ToggleSetting
                label="SMS Notifications"
                description="Receive notifications via SMS"
                checked={settings.smsNotifications}
                onChange={(checked) => onChange('smsNotifications', checked)}
            />
            <ToggleSetting
                label="Push Notifications"
                description="Receive push notifications"
                checked={settings.pushNotifications}
                onChange={(checked) => onChange('pushNotifications', checked)}
            />
            <ToggleSetting
                label="Booking Alerts"
                description="Get notified about new bookings"
                checked={settings.bookingAlerts}
                onChange={(checked) => onChange('bookingAlerts', checked)}
            />
            <ToggleSetting
                label="Payment Alerts"
                description="Get notified about payments"
                checked={settings.paymentAlerts}
                onChange={(checked) => onChange('paymentAlerts', checked)}
            />
            <ToggleSetting
                label="System Alerts"
                description="Receive system status alerts"
                checked={settings.systemAlerts}
                onChange={(checked) => onChange('systemAlerts', checked)}
            />
        </div>
    </div>
);

// Security Settings Component
const SecuritySettings = ({ settings, onChange }) => (
    <div className="settings-section">
        <h3>Security Settings</h3>
        <p className="section-description">Manage security and access controls</p>

        <div className="settings-list">
            <div className="setting-item">
                <div className="setting-info">
                    <h4>Change Password</h4>
                    <p>Update your admin password</p>
                </div>
                <button className="action-btn">Change</button>
            </div>
            <div className="setting-item">
                <div className="setting-info">
                    <h4>Two-Factor Authentication</h4>
                    <p>Add an extra layer of security</p>
                </div>
                <button className="action-btn">Enable</button>
            </div>
            <div className="setting-item">
                <div className="setting-info">
                    <h4>Session Timeout</h4>
                    <p>Auto logout after inactivity</p>
                </div>
                <select className="setting-select">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="120">2 hours</option>
                </select>
            </div>
        </div>
    </div>
);

// System Settings Component
const SystemSettings = ({ settings, onChange }) => (
    <div className="settings-section">
        <h3>System Configuration</h3>
        <p className="section-description">Configure system-wide settings</p>

        <div className="settings-list">
            <div className="setting-item">
                <div className="setting-info">
                    <h4>Database Backup</h4>
                    <p>Last backup: 2 hours ago</p>
                </div>
                <button className="action-btn">Backup Now</button>
            </div>
            <div className="setting-item">
                <div className="setting-info">
                    <h4>Clear Cache</h4>
                    <p>Clear system cache to improve performance</p>
                </div>
                <button className="action-btn">Clear</button>
            </div>
            <div className="setting-item">
                <div className="setting-info">
                    <h4>Maintenance Mode</h4>
                    <p>Enable maintenance mode for updates</p>
                </div>
                <button className="action-btn danger">Enable</button>
            </div>
            <div className="setting-item">
                <div className="setting-info">
                    <h4>System Logs</h4>
                    <p>View and download system logs</p>
                </div>
                <button className="action-btn">View Logs</button>
            </div>
        </div>
    </div>
);

// Setting Field Component
const SettingField = ({ label, description, type, value, onChange, prefix, suffix }) => (
    <div className="setting-field">
        <label className="field-label">{label}</label>
        <p className="field-description">{description}</p>
        <div className="field-input-wrapper">
            {prefix && <span className="input-prefix">{prefix}</span>}
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="field-input"
            />
            {suffix && <span className="input-suffix">{suffix}</span>}
        </div>
    </div>
);

// Toggle Setting Component
const ToggleSetting = ({ label, description, checked, onChange }) => (
    <div className="toggle-setting">
        <div className="toggle-info">
            <h4>{label}</h4>
            <p>{description}</p>
        </div>
        <label className="toggle-switch">
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
            <span className="toggle-slider"></span>
        </label>
    </div>
);

export default Settings;
