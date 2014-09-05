# moviefy
> a movie overview generator for Node.js

You have a big collection of movies and everytime you want to watch one of them, you don't know which to choose.

> What was the plot of this one?

And when you want to watch a movie with a friend, you don't want to tell them every storyline you remember. But you don't want to google every movie title and search for a good description and other information.

That's why I created the little command line tool `moviefy`. It queries the [iTunes API](https://www.apple.com/itunes/affiliates/resources/documentation/itunes-store-web-service-search-api.html) and generates an overview file for your movies.

## Installation
Run

`$ npm install moviefy -g`

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

where `my-movies` is the folder with all your movies and every movie is in its own subfolder. That has **two reasons**:

- *the tool works file extension independant:* You can store your movies in any file format, even as a copy of a DVD (like *Mission Impossible* above)
- *caching:* The tool will cache information about a movie in its folder. This way, you can change its information just by editing a json file.

### Notice

- `moviefy` will use the folder name of the movie, **NOT** its title! So name the folders well.

## Usage
Navigate to `my-movies`(the folder with all your movies inside of it) and run

`moviefy`

This will trigger the [iTunes API](https://www.apple.com/itunes/affiliates/resources/documentation/itunes-store-web-service-search-api.html) with every movie title and generates a HTML document with an overview of your movies in the `my-movies` folder.

The resulting file can then be opened inside of your browser.

### Options and Commands

#### reset

With `$ moviefy reset` you can delete the `info.json` file for **every** movie. This is useful when you chose the wrong language and you want to recreate your `info.json` files.

#### language

You can choose the language for the description by using the `--language [lang]` or its shortcut `-l [lang]` where `[lang]` is the [ISO code](http://en.wikipedia.org/wiki/%20ISO_3166-1_alpha-2) for your country.

Default is `US`.

#### output name

You can choose the output for the resulting HTML page by using the `--output [name]` or its shortcut `-o [name]` where `[name]` is the name for the output file. For example: If you want to have a `filme.html` instead of `movies.html`, you run this:

`$ moviefy -o filme`

Default is `movies`.

#### template

You can choose a template by specify its name.

At the moment, there are two templates: list *(default)* and poster

##### Template: list
`moviefy -t list`

![Template: list](https://cloud.githubusercontent.com/assets/4562885/4163953/e11f52a4-34ed-11e4-905a-5ebb62fefbd8.png)

##### Template: poster
`moviefy -t poster`

![Template: poster](https://cloud.githubusercontent.com/assets/4562885/4163952/e10746fa-34ed-11e4-8d21-bc67487ababf.png)

*After you click on a tile:*
![Template: poster](https://cloud.githubusercontent.com/assets/4562885/4163954/e1289800-34ed-11e4-90c1-ac237a56a90c.png)


*© iTunes for posters and information about the movies*