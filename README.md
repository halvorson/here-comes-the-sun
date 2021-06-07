# It's Always Sunny Somewhere

This was my May project during my "year of coding". I changed the name after making the repo due to the Firebase name space availability.

This is deployed at https://its-always-sunny-somewhere.web.app/

## App Description

This app allows a user to see how far it is until it's sunny based on phone orientation and location. 

I built it because I live in the Presidio in San Francisco. It's often super foggy here, but sunny both in Sausalito (3 miles away) and the Mission (~5 miles away, where I used to live). It's used to motivate me to actually get on my bike and ride, since it'll be sunny in just a few miles. 

I also somewhat want to move to Fairfax, so this could help if it's sunny up there a bit.  

## Tech Used

* Firebase Functions for serverless dev
  * I originally thought I would have to use a paid API, so wanted to keep my keys hidden. I ended up throwing the algorithm here, and was going to do "backend only"
  * I also used the local firebase emulator for the first time
* Recursive promises
  * My recursive algorithms both required calls to the National Weather Service API, so needed to be written as promises 
* Typescript
  * This was honestly a mistake. React components and typescript was a headache, and cost me a week. The Firebase functions side was better 

## "Algorithm" description

Once the backend has a start location and start direction, it checks the weather 2.5 miles away. If it's cloudy there, it doubles the distance and tries again. 

Once it finds sun, it queries between the last cloudy point and the first sunny point, recursively searching midpoints to find the closest sun. It stops when its search points are within ~2 miles of each other. 

It uses a "skyCover" metric from the National Weather Service, which can sometimes say it's cloudy if it's hazy (turns out it's an aviation description). I define "sunny" when Sky Cover < 35%.

## To-dos

* Make it ask for location AFTER first click
   * I'm struggling with this because I'm using a hook for useCurrentLocation(), so it's tricky to nest in another useEffect()
* Clean up the FE code
   * This was meant to be an afterthought (original project was BE only), but ended up getting pretty gnarly. I originally tried keeping everything in individual hooks, but eventually threw it all in app.jsx
   * Specifically, pass arguments to functional components with actual types, don't define type at the prop type every time. This is probably "interface", but I haven't figured it out 
* ? Add a Google Map overlay to show what points I queryied to get the result. I return the full array from the Firebase Function, so should be able to do it entirely FE
* ? Factor in night. It'll work for clear skies