import { default as User } from './User';
import { default as Event } from './Event';

User.hasMany(Event, { foreignKey: 'createdBy', as: 'events' });
Event.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

export { User, Event };
