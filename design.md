# Application Design Overview

## Vision

I want an application that can replace my use cases for FitBod: generating workouts based on muscle group selection and time available. Later I'd also like to implement logging and storing reps and weight used.

My ideal workflow is being able to access this app on a mobile phone, and enter muscle groups using a GUI, and receive workouts with details and descriptions in a GUI as well. I would also like to be able to check off workouts as I do them, so that I don't have to mentally track where I am in my workout. This doesn't have to be in a GUI, it could just be plain text.

Later down the line I would like to create features for recording and storing exercise information. This will require lots more work: defining an object model (do I make an object for a completed workout, and store an instance of that each time I do it? An object for a curcuit/set that is a list of exercise objects?), defining how that object model will be stored, serialized, deserialized, and so forth. I am going to focus on getting the first layer of functionality work, then tackle these features.

**An important detail** about this app is that I don't want to design it for scale. There are plenty of good workout apps out there that scale way better because people develop them as their full time job. As this is both a side project to gain some experience, and a way for me to replace something that I pay money for with something I can build myself. I want to design this to perfectly fit my use case and my needs, while still following good practices.

## Architecture

During the first few milestones of this application's development, there will be no backend, because there is not data persistance or retreival. There will only be a frontend which makes calls to the external APINinja Exercise API. Because of this I will use an MVP design pattern on the frontend. UI code will be isolated from input and API data processing, and the model/service layer will isolate API calls from the rest of the frontend.

Later, when data persistance is added, things will become slightly more complex. I will be storing my own business model objects in a database, but retreiving exercises from an external API. For now a good option could be fetching exercises from the API, and then querying the database for the data on those selected exercises.

## Tech stack
