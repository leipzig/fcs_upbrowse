var params = {
  jobDefinition: "sleep60", 
  jobName: "example", 
  jobQueue: "fcs-batch-queue"
 };
 batch.submitJob(params, function(err, data) {
   if (err) console.log(err, err.stack); // an error occurred
   else     console.log(data);           // successful response
   /*
   data = {
    jobId: "876da822-4198-45f2-a252-6cea32512ea8", 
    jobName: "example"
   }
   */
 });