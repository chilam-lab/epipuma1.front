// A Testimonials slider for a 
// friend's (fb.com/computer.doctor.xanthi/) 
// website i am developing

// Made with awesome -> Owl Carousel 2:
// https://github.com/OwlCarousel2/OwlCarousel2

$(function() {
  $('.owl-carousel.testimonial-carousel').owlCarousel({
    nav: true,
    navText: ['<i class="fa fa-chevron-left"></i>', '<i class="fa fa-chevron-right"></i>'],
    dots: false,
    responsive: {
      0: {
        items: 1,
      },
      750: {
        items: 2,
      }
    }
  });
});