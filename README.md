#### Setup

Step 1: Clone the repo to your machine

Step 2: Install Node(v5.5 or above) installed from http://nodejs.org/ or Homebrew (http://brew.sh/)

Step 3: Install MongoDB from https://www.mongodb.org/ or Homebrew (http://brew.sh/)

Step 4: Go to the project directory and run `npm install` and wait for the node modules to download

Step 5: Once everything is installed run `npm test` to make sure all tests pass

Step 6: Run `npm start` and use `http://localhost:3000/` as the base URL for the APIs

# Available API endpoints

`POST /articles`

Create a new article resource. Accepts `title` and `text` in the request body.

Sample Request Body

    { 
      title: 'A test article', 
      text: "This is a text paragraph.\n\nThis is another text paragraph separated by two line feeds.\r\rAnother paragraph here separated by two carriage returns.\r\n\r\nAnd then we have another line separated by two CR+LF." 
    }
    
`GET /articles/:id`

Returns the full article with the annotations if any

`GET /articles`

Returns a list of articles without annotations and limited to `5` articles by default but can be controlled by `limit` query parameter.

Allows pagination with the `since_id` query parameter.

`POST /articles/:id/annotations`

Add a new annotation to a paragraph in the article

Requires `paragraph`, which is a simple md5 hash of the paragraph, and `text`, which is the comment.

Here's an example of the request body with Node.js

    {
      paragraph: crypto.createHash('md5').update("This is another text paragraph separated by two line feeds.", 'utf8').digest('hex'),
      text: "This is a comment"
    }    
    

