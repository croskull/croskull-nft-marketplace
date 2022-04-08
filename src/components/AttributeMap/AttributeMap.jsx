import React , { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-solid-svg-icons';
const AttributeMap = ({
    value,
}) => {
        return (
            <>
            {map.get(value) ? map.get(value) : value }
            </>
    

    )
}

export default AttributeMap;

const map = new Map();
/*background*/
map.set('Redtheme', 'Red Graffiti');
map.set('Bluetheme', 'Blue Graffiti');
map.set('Whitetheme', 'White Graffiti');
map.set('Greentheme', 'Green Graffiti');
map.set('Purpletheme', 'Purple Graffiti');
/*skull*/
map.set('Whiteskullv1', 'White 1');
map.set('Whiteogreskull', 'Withe Ogre');
map.set('Whiteteethskull', 'Withe Teeth');
map.set('Greenskull', 'Green');
map.set('Ivoryogreskull', 'Ivory Ogre');
map.set('Purplesugarskull', 'Purple Sugar');
map.set('Redteethskull', 'Red Teeth');
map.set('Orangeskull', 'Orange');
map.set('Whiteskull2', 'White 2');
map.set('Bigsmileskull', 'Big Smile');
map.set('Vampireskull', 'Vampire');
map.set('Robotskull', 'Robot');
map.set('Celestialblueskull', 'Celestial');
map.set('Goldskull', 'Golden');
map.set('Halftoneskull', 'Halftone');
map.set('Yellowsugarskull', 'Yellow Sugar');
map.set('Yellowrobotskull', 'Golden Robot');
map.set('Prismaticskull', 'Prismatic');
map.set('Greensugarskull', 'Green Sugar');
map.set('Rainbowskull', 'Rainbow');
/*NOSE*/
map.set('Trianglenose', 'Triangle');
map.set('Heartnose', 'Heart');
map.set('Splittrianglenose', 'Split Triangle');
map.set('Twodotsnose', 'Two Dot');
map.set('Mnose', 'M');
map.set('Clownnose', 'Clown');
map.set('Reverseheartnose', 'Reverse Heart');
map.set('Conenose', 'Cone');
map.set('Piercingnose', 'Piercing');
map.set('Lilnose', 'Lil');
/*EYES*/
map.set('Eyes', 'Simple');
map.set('Demonblueeyes', 'Demon Blue');
map.set('EyesX', 'X');
map.set('HappyEyes', 'Happy');
map.set('Wormeyes', 'Worm Infection');
map.set('Greenthreeeyealien', 'Green Third Eyes');
map.set('Crazyeyes', 'Crazy');
map.set('Superboredeyes', 'Super Bored');
map.set('Bigeyes', 'Big');
map.set('Robotmotheyes', 'Robot');
map.set('Roundglasses', 'Glasses');
map.set('Blueeye', 'One Eye Blue');
map.set('Eyesoftheabyss', 'Abyss');
map.set('Cyclops', 'Cyclops');
map.set('Pirateeyes', 'Pirate');
map.set('Sanseyes', 'One Eye Fire');
map.set('Eyeglasses', 'Sunglasses');
map.set('Boredeyes', 'Bored');
map.set('3Dglasses', '3D Glasses');
map.set('Demonredeyes', 'Demon');
map.set('Mummyeyes', 'Mummy');
map.set('Toadeyes', 'Toad');
map.set('Redthreeeyealien', 'Red Third Eyes');
map.set('Diamondeyes', 'Diamond');
map.set('Aliencyclops', 'Alien');
map.set('Lasereyes', 'Laser');
/*HAT*/
map.set('Orangecap', 'Orange');
map.set('Coolhat', 'Cool');
map.set('Horn', 'Horn');
map.set('Cowboyhat', 'Cowboy');
map.set('Candle', 'Candle');
map.set('Evilhorns', 'Evil Horns');
map.set('Mummyhat', 'Mummy');
map.set('Devilhorns', 'Devil Horns');
map.set('Fishermanhat', 'FIsherman');
map.set('Sombrero', 'Sombrero');
map.set('Cutefroghat', 'Cute Frog');
map.set('Captainhat', 'Captain');
map.set('Celestialblueskull', 'Celestial');
map.set('Combedfire', 'Combed Fire');
map.set('Crestedhair', 'Crested');
map.set('Punkhair', 'Punk');
map.set('Fireflamedemonhair', 'Demon');
map.set('Magichorn', 'Magic Horn');
map.set('Bandana', 'Bandana');
map.set('Holy', 'Holy');
map.set('Chickenhat', 'Chicken');
map.set('Devilmask', 'Devil Mask');
map.set('Bananahat', 'Banana');
map.set('Headache', 'Headache');
map.set('Fortunetellerhat', 'Fortuneller');
map.set('Skullkingcrown', 'Crown');
map.set('Magehat', 'Mage');
map.set('Thirdeye', 'Third Eye');
map.set('Piratehat', 'Pirate');
map.set('Vikinghat', 'Viking');
map.set('Ghostflamedemonhair', 'Ghost');