module.exports = {
    "input": {
       /*
        * input to this step (specified in meta.json)
        * "url" : "https://rundexter.com"
        */
    },
    "privates": {
       /*
        * e.g. oauth keys, slack tokens
        * "instapaper_consumer_key": "somerandomcharacters",
        * "instapaper_consumer_secret": "somemorerandomcharacters"
        */
    },
    "providers": {
       "instapaper": {
          "access_token": "{\"oauth_token_secret\":\"providerdatacapturedydexter\",\"oauth_token\":\"moreproviderdatacapturedbydexter\"}"
       }
    }, 
    "settings": {
       /*
        * settings data passed to the step
        * "mustache": "A sample {mustache} template"
        */
    }
};
