document.addEventListener("DOMContentLoaded", function () {
  const buttons = document.querySelectorAll(".filter-btn");
  const items = document.querySelectorAll(".news-item");

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      // Active button state
      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");

      items.forEach(item => {
        const category = item.dataset.category;

        if (filter === "all" || category === filter) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  });
});
