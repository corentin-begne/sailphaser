/**
 * GameController
 *
 * @description :: Server-side logic for managing games
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	


  /**
   * `GameController.index()`
   */
  index: function (req, res) {
  	res.locals.layout = "layouts/game";
    return res.view("game.ejs", {     
      avatar:req.param("avatar")
    });
  }
};

