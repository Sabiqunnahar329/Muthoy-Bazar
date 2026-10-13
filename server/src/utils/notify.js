import Notification from '../models/Notification.js';
import CustomerNotification from '../models/CustomerNotification.js';

// Fire-and-forget: a failed alert must never break the request that caused it.
export const notify = (data) => Notification.create(data).catch((e) => console.error('notify failed:', e.message));
export const notifyCustomer = (data) => CustomerNotification.create(data).catch((e) => console.error('customer notify failed:', e.message));
