# Application Design Overview

## Vision

I want an application that can replace my use cases for FitBod: generating workouts based on muscle group selection and time available. Later I'd also like to implement logging and storing reps and weight used.

My ideal workflow is being able to access this app on a mobile phone, and enter muscle groups using a GUI, and receive workouts with details and descriptions in a GUI as well. I would also like to be able to check off workouts as I do them, so that I don't have to mentally track where I am in my workout. This doesn't have to be in a GUI, it could just be plain text.

Later down the line I would like to create features for recording and storing exercise information. This will require lots more work: defining an object model (do I make an object for a completed workout, and store an instance of that each time I do it? An object for a circuit/set that is a list of exercise objects?), defining how that object model will be stored, serialized, deserialized, and so forth. I am going to focus on getting the first layer of functionality work, then tackle these features.

**An important detail** about this app is that I don't want to design it for scale. There are plenty of good workout apps out there that scale way better because people develop them as their full time job. As this is both a side project to gain some experience, and a way for me to replace something that I pay money for with something I can build myself. I want to design this to perfectly fit my use case and my needs, while still following good practices.

## Architecture

During the first few milestones of this application's development, there will be no backend, because there is not data persistence or retrieval. There will only be a frontend which makes calls to the external APINinja Exercise API. Because of this I will use an MVP design pattern on the frontend. UI code will be isolated from input and API data processing, and the model/service layer will isolate API calls from the rest of the frontend.

Later, when data persistence is added, things will become slightly more complex. I will be storing my own business model objects in a database, but retrieving exercises from an external API. For now a good option could be fetching exercises from the API, and then querying the database for the data on those selected exercises.

## Tech stack

I have decided to use Bun has my main toolkit. After some reading it appears that Bun is the best toolkit option for small projects, because of its fast runtime and 4-in-1 tool nature.

## Build notes

8.23.26

What is keeping me from using this app myself?
- Lots of the workouts that are generated use equipment that my gym doesn't have
- Sometimes I just don't want to do a particular exercise that is generated. Or, most of the exercises will work, but one or two need to be switched out.
- This is me being picky, but I like to combine resistance types at the gym: free weights for about 1/2 of my exercises, and cable machines for the other. If I could implement that in the app, that would be great too.

How to address these points:
- Add an equipment filtering option to the workout generation
  - Pretty easy. Add a selector component, send that parameter to the api call. Will need to make a slight adjustment to the service layer to handle both the equipment parameter being present and absent
- Add a refresh button to individual exercises to allow those to be swapped out.
  - Make a button with an event listener. On click, it fetches an exercise, and swaps the into the workout object's exercise list at that index.
- Create a data structure that classifies certain equipment types into one of the two resistance types that I want to train with. Draw from both of these types when generating a workout. (Potential use of Adapter pattern?)
  - DS can be pretty easy in TS. Something like `Type freeweight = dumbbell | barbell | isometric machine"` and then the same for cable resistance. Then when creating a workout, divide num of workouts by 2, ensure 1/2 are free weight, 1/2 are cable.