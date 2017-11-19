# This is autocomplete test programm

## Native
REDIS_HOST="localhost/6379" REDIS_PWD="" REDIS_USER="" npm start

## Docker
docker build -t kimmo/autocomplete .
docker run -e REDIS_HOST="localhost/6379" -e REDIS_PWD="" -e REDIS_USER="" -p 8080:3000 -t kimmo/autocomplate 

## Google cloud stuff
For some reason the contex / auth setting in my mac did not work
I needed to go with a workaround with static authkey. The default 
command returned exit code 2 when authenticating with the kubernetes service
https://developers.google.com/identity/protocols/application-default-credentials

./gcloud config set container/use_application_default_credentials true
export GOOGLE_APPLICATION_CREDENTIALS=/Users/

./gcloud docker -- push gcr.io/autocomplete-16112017/autocomplete

Failed => needed to disable the store docker password to mac keychain

### Tag and push the image
docker tag kimmo/autocomplete gcr.io/autocomplete-16112017/autocomplete:3 
/Users/kimmok/Downloads/google-cloud-sdk/bin/gcloud docker -- push gcr.io/autocomplete-16112017/autocomplete
/Users/kimmok/Downloads/google-cloud-sdk/bin/gcloud docker -- tag gcr.io/autocomplete-16112017/autocomplete:2 gcr.io/autocomplete-16112017/autocomplete:latest


## Kubernetes
helm init
helm install stable/redis --name redis-autocomplete

## Note
get rid of the existing release
helm ls --all redis-autocomplete
helm del --purge redis-autocomplete

Get the redis passwor from the commandiline following the instructions

### Manually run the docker images
kubectl run autocompleate --image=gcr.io/autocomplete-16112017/autocompleate:latest --port 3000 --env "REDIS_HOST=redis-autocomplete-redis/6379" --env "REDIS_USER=" --env "REDIS_PWD=NGuijbLNAi"

kubectl expose deployment autocompleate --type=LoadBalancer --port 80 --target-port 3000

### All application content in yaml file
We use kubernetes 1.7.x so we need to use this api version
Check the api version using kubectl api-versions
apiVersion: apps/v1beta1

kubectl get secret --namespace default redis-autocomplete-redis -o jsonpath="{.data.redis-password}" | base64 --decode
 
edit the autocomplete.yaml file and add the password there

kubectl create -f autocomplete.yaml
kubectl get pods
kubectl get svc

Take the public IP adress from the service description and test with the browser


## Update
kubectl replace -f autocomplete.yaml --record

## Cleanup
kubectl delete -f ./autocomplete.yaml
kubectl get replicaset
kubectl delete replicaset xxx
kubectl get pods


