// importing the connector
const config = require('./dbconfig');
// function for getting all the instances from the table "test"
async function getInstances(){
 try {
  let instance = await config
   .query("SELECT * from test");
  return instance.rows;
 }catch (error){
  console.log(error);
 }
}
// function to get any one instance with a InstanceId
async function getInstance(InstanceId){
 try {
  let instance = await config
   .query("SELECT * from test where id = $1", [InstanceId]);
  return instance.rows[0];
 }catch (error){
  console.log(error);
 }
}
// function to insert a new instance into the database
async function addInstance(data){
 try {
  // In the SQL query “RETURNING *” is used to return the instance after adding into the table
  let instance = await config
   .query("INSERT into test (id, sensor1, sensor2) VALUES ($1, $2, $3) RETURNING *", 
    [data.id, data.sensor1, data.sensor2]);
  return instance.rows[0];
 }catch (error){
  console.log(error);
 }
}
// function to delete an instance from the table with Id
async function deleteInstance(id){
 try {
  let instance = await config
   .query("DELETE from test where id = $1", [id]);
  return;
 }catch (error){
  console.log(error);
 }
}
// exporting all the functions for importing and using in other files
module.exports = {
 getInstances: getInstances,
 getInstance: getInstance,
 addInstance: addInstance,
 deleteInstance: deleteInstance
};