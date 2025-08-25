import mongoose from 'mongoose';

const PrivateMessage = new mongoose.Schema({
  sender : {
    type: String,
    required: true,
  },
  receiver : {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp : {
    type: Date,
    default: Date.now,
  },
  type : {
    type : String,
    required : true
  }
});



const GroupMessage = new mongoose.Schema({
  sender : {
    type: String,
    required: true,
  },
  groupName : {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp : {
    type: Date,
    default: Date.now,
  },
  type : {
    type : String,
    required : true
  }
});


const PrivateMessageModel = mongoose.model('PrivateMessage', PrivateMessage);
const GroupMessageModel = mongoose.model('GroupMessage', GroupMessage);

export {PrivateMessageModel, GroupMessageModel};