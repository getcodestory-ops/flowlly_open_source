Here is the receipe for adding new route and corresponding functionality to the app.

For adding a new route, you will use files in src/api folder . Here you can decide if you can create a new file or add an existing file.

Here you can create the method for the route.

We are using axios for the api calls.

We are also using react query for the api calls.
so you will use useQuery hook to fetch the data and useMutation hook to create the data.

So when you are asked to add a new route, you will first check if the route is already present in the api folder. If it is present, you will add the method to the existing file. If it is not present, you will create a new file in the api folder. then wrap the axios call with useQuery or useMutation hook.

for making the api call, you will also need to use sessiontokens and projectId for most of the cases. you can get the sessiontoken from the useSessionStore and projectId from the useStore hook @/utils/store.ts
