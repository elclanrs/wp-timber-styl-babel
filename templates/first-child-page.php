<?php
/*
Template Name: Go to first child page
*/
$subpages = get_pages("child_of=$post->ID&sort_column=menu_order");
if ($subpages) {
  $firstchild = $subpages[0];
  wp_redirect(get_permalink($firstchild->ID));
}
