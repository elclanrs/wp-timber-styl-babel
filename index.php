<?php

$data = Timber::get_context();
$data['post'] = new TimberPost();
$data['posts'] = Timber::get_posts();

Timber::render('index.twig', $data);
