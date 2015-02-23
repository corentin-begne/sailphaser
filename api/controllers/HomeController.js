/**
 * HomeController
 *
 * @description :: Server-side logic for managing homes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

 module.exports = {
   


  /**
   * `HomeController.index()`
   */
   index: function (req, res) {
    var avatars = ["pooh", "piglet", "tiger", "rabbit"];
    res.locals.layout = "layouts/home";
    return res.view("home.ejs", {     
      avatars:avatars
    });
  }
};

