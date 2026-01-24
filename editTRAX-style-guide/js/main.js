/**
 * Style Guide - Interactive Components
 *
 * This file handles interactivity for the component examples.
 * Keep this file minimal - it's for demonstration purposes only.
 */

document.addEventListener('DOMContentLoaded', function() {

  // ============================================
  // TABS
  // ============================================
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const targetId = this.getAttribute('data-tab');

      // Remove active class from all tabs and contents
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tabContents.forEach(c => c.classList.remove('active'));

      // Add active class to clicked tab and its content
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      document.getElementById(targetId).classList.add('active');
    });
  });


  // ============================================
  // COLLAPSIBLE / ACCORDION
  // ============================================
  const collapsibles = document.querySelectorAll('.collapsible');

  collapsibles.forEach(collapsible => {
    const toggle = collapsible.querySelector('.collapsible-toggle');
    const body = collapsible.querySelector('.collapsible-body');

    // Set initial max-height for open collapsibles
    if (collapsible.classList.contains('open')) {
      body.style.maxHeight = body.scrollHeight + 'px';
    }

    toggle.addEventListener('click', function() {
      collapsible.classList.toggle('open');

      if (collapsible.classList.contains('open')) {
        body.style.maxHeight = body.scrollHeight + 'px';
      } else {
        body.style.maxHeight = '0';
      }
    });
  });


  // ============================================
  // MODAL
  // ============================================
  const openModalBtn = document.getElementById('open-modal');
  const modalOverlay = document.getElementById('demo-modal');
  const modalClose = modalOverlay?.querySelector('.modal-close');
  const modalCancel = modalOverlay?.querySelector('.modal-cancel');

  function openModal() {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (openModalBtn) {
    openModalBtn.addEventListener('click', openModal);
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  if (modalCancel) {
    modalCancel.addEventListener('click', closeModal);
  }

  // Close modal when clicking overlay
  if (modalOverlay) {
    modalOverlay.addEventListener('click', function(e) {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  // Close modal on Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      if (modalOverlay?.classList.contains('active')) {
        closeModal();
      }
      if (uploadModalOverlay?.classList.contains('active')) {
        closeUploadModal();
      }
    }
  });


  // ============================================
  // UPLOAD MODAL
  // ============================================
  const openUploadModalBtn = document.getElementById('open-upload-modal');
  const uploadModalOverlay = document.getElementById('upload-modal');
  const uploadModalClose = uploadModalOverlay?.querySelector('.upload-modal-close');

  function openUploadModal() {
    uploadModalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeUploadModal() {
    uploadModalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (openUploadModalBtn) {
    openUploadModalBtn.addEventListener('click', openUploadModal);
  }

  if (uploadModalClose) {
    uploadModalClose.addEventListener('click', closeUploadModal);
  }

  // Close upload modal when clicking overlay
  if (uploadModalOverlay) {
    uploadModalOverlay.addEventListener('click', function(e) {
      if (e.target === uploadModalOverlay) {
        closeUploadModal();
      }
    });
  }


  // ============================================
  // DROP ZONE INTERACTIONS
  // ============================================
  const dropZones = document.querySelectorAll('.drop-zone');

  dropZones.forEach(zone => {
    zone.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', function(e) {
      e.preventDefault();
      this.classList.remove('drag-over');
    });

    zone.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('drag-over');
      // In a real app, handle the dropped files here
    });
  });


  // ============================================
  // PROGRESS BAR DEMO (Optional animation)
  // ============================================
  // Uncomment below to see animated progress
  /*
  const progressFills = document.querySelectorAll('.progress-fill:not(.indeterminate .progress-fill)');
  progressFills.forEach(fill => {
    const targetWidth = fill.style.width;
    fill.style.width = '0';
    setTimeout(() => {
      fill.style.width = targetWidth;
    }, 100);
  });
  */

});
