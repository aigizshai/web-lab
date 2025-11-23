import User from './User';
import Event from './Event';

User.hasMany(Event, { foreignKey: 'createdBy', as: 'events' });
Event.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

export { User, Event };
