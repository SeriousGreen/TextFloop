<?php
# load all the lines in the text file into an array where each line is
# an element in the array
$myArray = file("TF_DB.txt");
$result = "";

//generate a random number between 0 and 4276
$index = mt_rand(0,4276);

$myIndexArray = file("sortedsix.txt");
$key = $myIndexArray[$index];
$key = chop($key);
$result = $key;


foreach ($myArray as $wordpair) {
  //find each word that matches the key word and append it to $result
  if (preg_match("/^$key/", chop($wordpair))) {
    $wordpair = chop( $wordpair ); // remove newline character from end of line
    list($junk, $word) = explode("~", $wordpair, 2); // make $junk first string and $word second string
    $result .= "~" . $word;
  }
}

echo $result; //send result
?>
