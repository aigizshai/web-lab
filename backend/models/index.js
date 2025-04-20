
import User from "./User.js";
import Event from "./Event.js";



User.hasMany(Event, {foreignKey: "createdBy", as: "events"});
Event.belongsTo(User, {foreignKey: "createdBy",as: "creator"});

  
export{ User, Event };
