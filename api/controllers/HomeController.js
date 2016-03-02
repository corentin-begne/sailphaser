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
    res.locals.layout = "layouts/home";
    return res.view("home.ejs");
  }
};