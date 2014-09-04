# moviefy
> a movie overview generator for Node.js

You have a big collection of movies and everytime you want to watch one of them, you don't know which to choose.

> What was the plot of this one?

And when you want to watch a movie with a friend, you don't want to tell them every storyline you remember. But you don't want to google every movie title and search for a good description and other information.

That's why I created the little command line tool ```moviefy```. It queries the [iTunes API](https://www.apple.com/itunes/affiliates/resources/documentation/itunes-store-web-service-search-api.html) and generates an overview file for your movies.

## Installation
Run

```npm install moviefy -g```

to install this script globally on your machine.

## File organisation
Your movie files need to be in the following folder structure:

```
my-movies/
|
|- Finding Nemo/
|  |- Finding Nemo.mov
|
|- Up/
|  |- Up.mp4
|
|- Mission Impossible/
|  |- AUDIO TS
|  |- VIDEO TS
|
...
```

where ```my-movies``` is the folder with all your movies and every movie is in its own subfolder. That has **two reasons**:

- *the tool works file extension independant:* You can store your movies in any file format, even as a copy of a DVD (like *Mission Impossible* above)
- *caching:* The tool will cache information about a movie in its folder. This way, you can change its information just by editing a json file.

### Notice

- ```moviefy``` will use the folder name of the movie, **NOT** its title! So name the folders well.

## Usage
Navigate to ```my-movies```(the folder with all your movies inside of it) and run

```moviefy```

This will trigger the [iTunes API](https://www.apple.com/itunes/affiliates/resources/documentation/itunes-store-web-service-search-api.html) with every movie title and generates a HTML document with an overview of your movies in the ```my-movies``` folder.

The file is called ```movies.html``` and can then be opened inside of your browser.
