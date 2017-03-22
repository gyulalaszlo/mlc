(ns
 core/pipe
 )


(extern "C"

        =>  (#tpl [src ... steps]
                  "size_t {{ src }}_i = 0;
                  size_t {{ src }}_len = len();
                  size_t
                  {{{ src }}} ")
        )


(deftemplate
  "

loop-var expr = _{{ expr }}_begin
loop-len expr = _{{ expr }}_end


loop-prolog T expr =
  // temporary storage for the expression result
  struct { {{{ T }}} begin; {{{ T }}} end; } {{ expr }}_range = {{{ expr }}};

  /* begin-end points {{{ expr }}} */
  {{{ T }}} {{ (loop-var expr) }} = {{{ expr }}}_range.begin;
  {{{ T }}} {{ (loop-len expr) }} = {{{ expr }}}_range.end;


loop-header expr =
  while( {{ (loop-var expr) }} != {{ (loop-len expr) }} ) {


loop-footer T name range =
  }

loop-epilog T name range =

pipe src body =
  {{{ (loop-prolog src.T src.expr) }}}

  {{{ (loop-header (loop-var src.expr )  }}}
    {{{ body }}}
  {{{ loop-epilog src.T src.expr) }}}
  ")

