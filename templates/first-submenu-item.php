<?php
/*
Template Name: Go to first submenu item
*/
global $post;
$menu_items = wp_get_nav_menu_items('main');
$title = $post->post_title;
$parent = array_filter($menu_items, function($item) use($title) {
  return $item->title === $title;
});
$parent = array_shift($parent);
if (isset($parent)) {
  $children = array_filter($menu_items, function($item) use($parent) {
    return $item->menu_item_parent === $parent->post_name;
  });
  $first_child = array_shift($children);
  wp_redirect($first_child->url);
}
